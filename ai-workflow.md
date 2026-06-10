# AI Workflow Note

## Tools Used
- **Claude (Anthropic)** — architecture decisions, phase planning, 
  all prompt design, debugging diagnosis, documentation
- **Deepseek V4 (via OpenCode)** — code implementation from prompts

## Where AI Materially Sped Up My Work

**Architecture planning**
Claude analyzed the full assessment requirements and produced a 
complete phase-by-phase build plan with tech stack justification 
before I wrote a single line of code. This prevented scope creep 
and kept decisions deliberate.

**Boilerplate elimination**
Supabase schema with RLS policies, Express middleware, Zustand stores,
Axios interceptors — all generated from precise prompts. These are 
correct-by-construction patterns that would otherwise require 
documentation lookups.

**Debugging**
When login returned 404, Claude diagnosed the ES module/CommonJS 
inconsistency immediately from the error description. When CORS 
blocked the live deployment, Claude identified the middleware 
ordering issue without needing to see the full file.

**Documentation**
All README, architecture notes, and this AI workflow note drafted 
by Claude with full technical accuracy.

## What I Changed or Rejected from AI Output

- **Editor layout:** AI-generated editor had a small writing area. 
  I identified this as a UX problem and directed a fix with specific 
  min-height requirements.
- **Auth persistence:** Initial implementation used only localStorage 
  token check. I identified the refresh logout bug and directed the 
  fix using supabase.auth.getSession() + onAuthStateChange.
- **CORS config:** AI placed CORS middleware after other middleware. 
  I diagnosed the preflight failure and directed it to be moved first.
- **Sharing null email bug:** AI omitted shared_with_email from the 
  insert payload. I caught this from the Supabase constraint error 
  and directed the targeted fix.

## How I Verified Correctness

- Tested every feature manually after each phase before moving on
- Used browser DevTools (Network + Console) to diagnose failures
- Ran 8 automated Jest tests covering the full document CRUD lifecycle
- Tested the complete sharing flow with two separate user accounts
- Verified live deployment independently from local development

## Reflection

AI handled implementation velocity. I handled judgment — what to build,
what to cut, what was broken, and why. The combination shipped a 
working full stack product with auth, rich text editing, file upload, 
sharing, persistence, tests, and deployment in under 5 hours.
