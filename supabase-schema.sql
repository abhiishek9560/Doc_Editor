-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  created_at timestamptz default now()
);

-- Documents table
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  title text not null default 'Untitled Document',
  content jsonb default '{}',
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Document shares table
create table public.document_shares (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  shared_with_email text not null,
  shared_with_id uuid references public.profiles(id) on delete cascade,
  permission text default 'view' check (permission in ('view', 'edit')),
  created_at timestamptz default now(),
  unique(document_id, shared_with_email)
);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_shares enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can CRUD own documents"
  on public.documents for all
  using (auth.uid() = owner_id);

create policy "Shared users can view documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.document_shares
      where document_id = documents.id
      and shared_with_id = auth.uid()
    )
  );

create policy "Shared users with edit can update"
  on public.documents for update
  using (
    exists (
      select 1 from public.document_shares
      where document_id = documents.id
      and shared_with_id = auth.uid()
      and permission = 'edit'
    )
  );

create policy "Document owners can manage shares"
  on public.document_shares for all
  using (
    exists (
      select 1 from public.documents
      where id = document_shares.document_id
      and owner_id = auth.uid()
    )
  );

create policy "Users can see shares for them"
  on public.document_shares for select
  using (shared_with_id = auth.uid());

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_updated_at
  before update on public.documents
  for each row execute procedure update_updated_at();
