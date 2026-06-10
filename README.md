# DocFlow — Collaborative Document Editor

A lightweight collaborative document editor built for the Ajaia AI-Native 
Full Stack Developer Assessment.

**Live Demo:** https://doc-editor-roan.vercel.app

**Test Credentials:**
| User | Email | Password |
|------|-------|----------|
| Abhishek (Owner) | abhishek@ajaia.dev | Test@1234 |
| Bob (Shared User) | bob@ajaia.dev | Test@1234 |

## Features
- Rich text document editing (Bold, Italic, Underline, Headings, Lists, Alignment)
- Document creation, renaming, and deletion
- File import (.txt, .md, .docx → editable documents)
- Document sharing with view/edit permissions
- Auto-save with 2 second debounce
- Session persistence across page refreshes
- Clean responsive UI

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Rich Text Editor | Tiptap |
| Backend | Node.js, Express |
| Database + Auth | Supabase (PostgreSQL + Auth) |
| File Parsing | mammoth (.docx), buffer (.txt/.md) |
| State Management | Zustand |
| HTTP Client | Axios |
| Deployment | Vercel (frontend), Render (backend) |

## Local Setup

### Prerequisites
- Node.js 18+
- A Supabase project (free tier)

### 1. Clone the repository
git clone https://github.com/abhiishek9560/Doc_Editor.git
cd Doc_Editor

### 2. Backend setup
cd server
cp .env.example .env
# Fill in your Supabase credentials in .env
npm install
node src/index.js
# Server runs on http://localhost:5000

### 3. Frontend setup
cd client
cp .env.example .env
# Fill in your Supabase credentials and API URL in .env
npm install
npm run dev
# App runs on http://localhost:5173

### 4. Database setup
Run the SQL schema in your Supabase SQL Editor.
Schema file: supabase-schema.sql (included in repo root)

### 5. Run tests
cd server
npm test

## Deployment
- Frontend deployed on Vercel
- Backend deployed on Render (free tier)
- Database hosted on Supabase

## Known Limitations
- .docx file import preserves plain text only (rich formatting stripped)
- No real-time collaboration (single user editing at a time)
- Free tier Render backend may have cold start delay (~30 seconds)
