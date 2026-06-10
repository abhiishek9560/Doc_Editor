# Architecture Notes

## What I Prioritized and Why

Given a 4-6 hour timebox, I made deliberate scope decisions to maximize 
depth in core areas over shallow coverage everywhere.

### Core Architecture

DocFlow follows a standard three-tier architecture:

**Frontend (React + Vite)**
- Zustand for lightweight global state (auth + documents)
- Axios with request interceptors for automatic JWT attachment
- React Router with protected routes and session-aware guards
- Tiptap for rich text editing — chosen over Quill (outdated) and 
  Draft.js (complex) for its headless React-native design

**Backend (Node.js + Express)**
- Stateless REST API — all auth via JWT Bearer tokens
- Supabase Admin client for server-side DB operations bypassing RLS
- Multer with memory storage for file uploads (no disk I/O)
- mammoth for .docx text extraction

**Database (Supabase + PostgreSQL)**
- Three core tables: profiles, documents, document_shares
- Row Level Security (RLS) policies enforce access at DB layer
- Trigger auto-creates profile on user signup
- Cascading deletes ensure referential integrity

### Key Technical Decisions

**Tiptap over alternatives**
Tiptap is headless and React-native. It stores content as JSON 
(not HTML strings), making it safe to persist and load without 
sanitization concerns. StarterKit bundles all required extensions.

**Supabase for Auth + DB**
Using Supabase Auth means JWTs are managed by a battle-tested service.
onAuthStateChange listener handles token refresh automatically, 
solving the session persistence problem cleanly.

**Memory storage for file uploads**
Files are processed in-memory and never written to disk. This keeps 
the Render deployment stateless and avoids ephemeral filesystem issues.

**Debounced auto-save**
2 second debounce prevents excessive API calls while typing. Manual 
save button gives users explicit control. Save status indicator 
(Unsaved → Saving → Saved) provides clear feedback.

### What I Would Build Next (with 2-4 more hours)

1. **Rich formatting preservation on .docx import** — use mammoth's 
   HTML extraction mode + Tiptap's HTML import extension
2. **Real-time collaboration** — Yjs CRDT + Tiptap collaboration 
   extension + WebSocket server
3. **Document version history** — store content snapshots on each save
4. **Export to PDF/Markdown** — server-side rendering or client-side export
5. **Role-based permissions** — granular owner/editor/viewer access control

### Intentional Scope Cuts
- No real-time collaboration — too risky in timebox, would require 
  WebSocket infrastructure and conflict resolution
- No .docx rich formatting — mammoth HTML mode + Tiptap HTML parser 
  adds 30-45 min with meaningful bug risk
- No version history — requires snapshot storage strategy beyond scope
- No email notifications for shares — requires email service integration
