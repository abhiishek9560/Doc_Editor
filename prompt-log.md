# Prompt Log — DocFlow Build

## Overview
Built using Claude (Anthropic) for architecture and prompt design,
and Deepseek V4 via OpenCode for implementation.

---

## Phase 1 — Project Scaffold + Auth
**Goal:** Set up monorepo, Express backend with Supabase integration,
React frontend with auth flow, protected routes, login/signup pages.

**Prompt used:**
Scaffold a full stack monorepo for a collaborative document editor 
called DocFlow. Set up a Node/Express backend with Supabase 
integration, JWT middleware for authentication, and routes for auth, 
documents, shares, and file uploads. On the frontend, initialize 
React with Vite and Tailwind, install Tiptap for rich text editing, 
set up Zustand for auth state, axios with token interceptors, and 
React Router with protected routes. Include login and signup pages 
with clean professional UI.

**Output:** Complete monorepo scaffold with working login/signup,
JWT auth middleware, protected routes, and Supabase client setup.

---

## Phase 2 — Document CRUD
**Goal:** Full document create, list, rename, delete with ownership
model and dashboard UI separating owned vs shared documents.

**Prompt used:**
Build the document CRUD layer for DocFlow. On the backend, create 
Express routes for listing (owned + shared), creating, fetching, 
updating, and deleting documents with proper ownership and permission 
checks. On the frontend, build the dashboard page with a two-section 
layout separating owned and shared documents, a document card grid 
with rename/delete interactions, and a Zustand store managing 
document state. UI should be clean, minimal, and professional 
with blue accents.

**Output:** Dashboard with owned/shared sections, document cards
with three-dot menus, full CRUD API with ownership checks.

---

## Phase 3 — Rich Text Editor + Sharing
**Goal:** Tiptap editor with full formatting toolbar, auto-save,
inline title editing, and share modal with permission control.

**Prompt used:**
Build the core document editing experience using Tiptap. Create 
a rich text editor with a formatting toolbar supporting headings, 
bold, italic, underline, lists, and text alignment. Build the 
editor page with an inline-editable title, auto-save with 2 second 
debounce, manual save, and save status indicator. Add a share modal 
that lets document owners share with other users by email with view 
or edit permissions, backed by share management API endpoints.

**Output:** Full editor with toolbar, auto-save, title editing,
share modal with permission selector and existing shares list.

---

## Phase 4 — File Upload
**Goal:** Import .txt, .md, .docx files as new editable documents
with drag-and-drop UI.

**Prompt used:**
Add file import functionality to DocFlow. Backend uses multer with 
memory storage to receive .txt, .md, and .docx files, parses 
content to Tiptap JSON format (mammoth for docx, buffer toString 
for text files), and creates a new document. Frontend has a 
drag-and-drop upload modal with file preview, format badges, 
and error handling. Successful upload navigates directly to 
the new document editor.

**Output:** Working file import for all three formats with
drag-and-drop UI, file preview, and format validation.

---

## Phase 5 — Tests + Deployment Prep
**Goal:** Automated API tests, environment configs, build verification.

**Prompt used:**
Add automated Jest and Supertest tests covering health check, auth, 
document CRUD, and access control after deletion. Export Express app 
separately from listen for testability. Add environment example files, 
gitignore, and update CORS to accept a configurable FRONTEND_URL 
environment variable for deployment. Verify client build completes 
without errors.

**Output:** 8 passing Jest tests, production build verified,
environment example files, gitignore at all levels.

---

## Phase 6 — Documentation
**Goal:** All submission documentation files.

**Prompt used:**
Create all submission documentation: README with setup instructions 
and test credentials, architecture note explaining technical decisions 
and intentional scope cuts, AI workflow note documenting tools used 
and what was changed or rejected, SUBMISSION.md listing all 
deliverables with working/incomplete/next features, and the 
Supabase schema SQL file.

**Output:** README.md, architecture.md, ai-workflow.md, 
SUBMISSION.md, supabase-schema.sql, prompt-log.md.

---

## Debugging Sessions

### Fix: Login route not found
**Problem:** POST /api/auth/login returning 404
**Diagnosis:** ES module/CommonJS inconsistency in route imports
**Fix prompt:** Check server package.json type field, verify all 
files use consistent import/export syntax, restart server.

### Fix: Editor not accepting input
**Problem:** Cannot type in Tiptap editor
**Diagnosis:** Wrapper div with conflicting CSS blocking pointer events,
editable prop not passed to useEditor
**Fix prompt:** Hardcode editable:true in useEditor, remove wrapper 
div, add ProseMirror CSS to index.css.

### Fix: Session lost on refresh
**Problem:** User logged out on every page refresh
**Diagnosis:** initializeAuth using localStorage token without 
verifying with Supabase, ProtectedRoute redirecting before 
session restored
**Fix prompt:** Replace with supabase.auth.getSession(), add 
onAuthStateChange listener, add isLoading guard to ProtectedRoute.

### Fix: CORS blocking live deployment
**Problem:** All API calls blocked by CORS on Vercel deployment
**Diagnosis:** CORS middleware placed after other middleware,
missing OPTIONS preflight handler
**Fix prompt:** Move CORS to first middleware, add app.options('*', cors()),
hardcode Vercel URL in allowed origins.
