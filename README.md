# DocFlow - Collaborative Document Editor

A full-stack collaborative document editing platform built with React, Node.js/Express, and Supabase.

## Project Structure

```
ajaia-collab-editor/
├── client/          (React + Vite + Tailwind CSS)
├── server/          (Node.js + Express)
└── README.md
```

## Features

- 🔐 User authentication with Supabase
- 📝 Rich text editor with TipTap
- 📤 Document upload and sharing
- 🚀 Real-time collaboration capabilities
- 🎨 Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account and project

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The server will run on http://localhost:5000

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client will run on http://localhost:5173

## Environment Variables

### Server (.env)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PORT` - Server port (default: 5000)

### Client (.env)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_URL` - Backend API URL (http://localhost:5000)

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- TipTap (Rich Text Editor)
- Zustand (State Management)
- React Router
- Axios
- Lucide React (Icons)

### Backend
- Node.js + Express
- Supabase
- Multer (File uploads)
- Mammoth (DOCX parsing)
- Jest + Supertest (Testing)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - List user documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Sharing
- `POST /api/shares` - Share document
- `GET /api/shares/:id` - Get share details
- `DELETE /api/shares/:id` - Revoke share

### Uploads
- `POST /api/upload` - Upload file

## License

MIT
