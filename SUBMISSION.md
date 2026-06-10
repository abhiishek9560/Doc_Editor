# Submission — DocFlow

## Candidate
Abhishek Kumar — abhishekkumar95560@gmail.com

## Live Product
**URL:** https://doc-editor-roan.vercel.app

**Test Credentials:**
| User | Email | Password | Role |
|------|-------|----------|------|
| Abhishek | abhishek@ajaia.dev | Test@1234 | Owner |
| Bob | bob@ajaia.dev | Test@1234 | Shared recipient |

## What Is Included
| File | Description |
|------|-------------|
| client/ | React + Vite frontend source |
| server/ | Node.js + Express backend source |
| README.md | Local setup and run instructions |
| architecture.md | Technical decisions and tradeoffs |
| ai-workflow.md | AI tools usage and verification process |
| SUBMISSION.md | This file |
| supabase-schema.sql | Database schema for local setup |
| video.txt | Walkthrough video link |

## What Is Working
- User authentication (login, logout, session persistence)
- Document creation, renaming, deletion
- Rich text editing (Bold, Italic, Underline, H1/H2/H3, 
  Bullet lists, Numbered lists, Text alignment)
- Auto-save with debounce + manual save
- File import (.txt, .md, .docx → editable documents)
- Document sharing with view/edit permissions
- Owned vs shared document distinction on dashboard
- 8 automated API tests passing
- Full deployment on Vercel + Render

## What Is Incomplete
- .docx import preserves plain text only (no rich formatting)
- No real-time collaboration

## What I Would Build Next (2-4 more hours)
1. Rich .docx formatting preservation via mammoth HTML mode
2. Real-time collaboration with Yjs + WebSockets
3. Document version history
4. Export to PDF or Markdown
5. Role-based sharing permissions
