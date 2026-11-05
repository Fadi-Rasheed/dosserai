<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Dosserai

Personal AI knowledge base: upload a file, extract and embed its contents, discard the original, query in natural language, get grounded answers with source citations. Name = dossier + AI.

Live product: dosserai.com. Target users: personal and small-team, $0/month infra (Supabase + Vercel free tiers).

## Product invariants

- Answers must be grounded in the user's own documents and cite the exact document + chunk.
- Users are fully isolated. Never query or pass another user's data to the model — even in bugs, tests, or "admin" shortcuts.
- Cross-document connections are a core feature, not an add-on. Compute them at upload time; surface them at query time.
- Original files are never stored. Upload is in-memory only: extract text → chunk → embed → discard the file. Only the filename, upload date, summary, and vector chunks persist.
- Support PDF, DOCX, TXT, Markdown, and scanned images (OCR).
- Queries and answers may be in any language.
- Chat history (messages + sources) persists across sessions.
- Rate-limit queries per user per day (`DAILY_QUERY_LIMIT`, default 50).

## Stack (do not substitute)

| Layer         | Use                                                                           |
| ------------- | ----------------------------------------------------------------------------- |
| App           | Next.js App Router, shadcn/ui, Tailwind (`tailwind.config.ts`)                |
| Client state  | TanStack React Query (`@tanstack/react-query`)                                |
| API           | Next.js Route Handlers under `app/api/`                                       |
| Auth          | Supabase Auth + middleware session checks                                     |
| DB            | Supabase Postgres + pgvector (`vector(1536)`)                                 |
| Upload        | In-memory / request-scoped only — no persistent file storage                  |
| Embeddings    | Gemini `gemini-embedding-001` (1536d, Google AI Studio free tier)             |
| LLM           | Groq `openai/gpt-oss-120b` (chat completions, free tier)                      |
| OCR           | Groq `meta-llama/llama-4-scout-17b-16e-instruct` (vision, free tier)          |
| Processing    | Upload route handler — in-memory extract, chunk, embed (no file persistence)  |
| RAG           | Custom `lib/rag/` (`chunk`, `embed`, `search`, `generate`) — direct API calls |
| Observability | Vercel Logs + Analytics (app/API) and Supabase Dashboard (data/auth)          |
| Deploy        | Vercel                                                                        |

Do not add Pinecone, LangChain, LangSmith, a separate vector DB, extra backend services, or paid infra. Prefer consolidating on Supabase + Vercel.

## Data isolation (non-negotiable)

- Every user-owned table has `user_id` (or joins to a row that does).
- Enable RLS on `documents`, `chunks`, `doc_connections`, `messages`, `usage`. Session client: SELECT on all; DELETE on own `documents` only. No client INSERT/UPDATE on `usage`, `chunks`, `messages`, or `doc_connections`.
- Query usage increments via `increment_query_usage` RPC (atomic daily cap), callable only with the service role; `user_id` and limit come from the authenticated session and server env. Ingest and message writes also use `SUPABASE_SERVICE_ROLE_KEY` server-side only (`createSupabaseServiceClient()`).
- All RAG search is scoped to the authenticated user. The model only ever sees that user's chunks.
- Use the anon/session client for user reads. Never expose the service role key to the client.
- Original uploads never persist. There is no download, preview, or re-fetch of source files — only extracted chunks and metadata.

## Pipelines

**Ingest (upload):** `POST /api/documents/upload` → extract text in memory (pdf-parse / mammoth / Groq vision OCR / marked) → semantic chunks (~500 tokens, 100 overlap) → embed 1536d (Gemini) → store chunks + document row (filename, uploaded_at, summary) → embed document summary → update `doc_connections` with top-N related docs → discard original bytes (never written to disk or object storage).

**Query:** embed question → pgvector cosine top-K across all of that user's docs → rerank → assemble context with source metadata → Groq grounded answer → return citations + cross-doc connections → save message + sources.

## Observability (do not substitute)

Use **both** layers below — they are complementary, not alternatives. Do not add LangSmith, LangChain tracing, or a separate APM.

**Vercel Logs + Analytics — app and API layer**

- API route errors, stack traces, timeouts, and serverless limits (especially upload processing).
- Structured logs from `lib/rag/` and `lib/data/` (embed ms, chunks retrieved, generate ms) emitted from route handlers.
- Vercel Analytics for page traffic only — not for RAG or database debugging.

**Supabase Dashboard — data and auth layer**

- Verify `documents`, `chunks`, `messages`, and `usage` rows after ingest or chat.
- Auth events, RLS policy issues, and database size vs. free-tier limits.
- SQL Editor for ad-hoc pgvector query checks.

| Symptom                             | Check first                                                 |
| ----------------------------------- | ----------------------------------------------------------- |
| HTTP error / timeout / crash in API | Vercel Logs                                                 |
| 200 response but empty UI           | Supabase (rows + RLS)                                       |
| Wrong or missing RAG answers        | Supabase (chunks/embeddings), then Vercel (pipeline errors) |
| Login / session issues              | Supabase Auth                                               |
| Page traffic                        | Vercel Analytics                                            |

## Schema (keep in sync)

`documents` (filename, uploaded_at, summary), `chunks` (content, embedding vector(1536), chunk_index, metadata), `doc_connections` (doc_id, related_doc_id, similarity), `messages` (role, content, sources jsonb), `usage` (user_id, date, queries_count). IVFFlat index on `chunks.embedding` with `vector_cosine_ops`. Schema lives in `supabase/migrations/`.

## Routes and layout

```
app/(auth)/login, register
app/dashboard          document list (filename + upload date only)
app/chat               query UI
app/upload             drag-and-drop
app/api/documents/upload | list | [id] DELETE
app/api/chat/query | history
app/api/connections/[docId]
app/api/usage
```

Shared UI: `components/ui/` (shadcn), `QueryProvider`, `ChatComposer`, `ChatMessageList`, `DocumentListItem`, `ConnectionGraph`, `SourceCitation`. RAG in `lib/rag/` (`chunk`, `embed`, `search`, `generate`). Parsers in `lib/parsers/`. Supabase clients in `lib/supabase/`. Protect routes in `middleware.ts`.

## Data access (three layers)

**Server reads/writes — `lib/data/`**  
Supabase + RLS. Called by route handlers and server components only. Never import from client components.

**Client HTTP — `lib/api/`**  
Typed fetch helpers for the browser. All paths live in `lib/api/routes.ts` (`apiRoutes`) — do not hardcode `/api/...` elsewhere. Shared `fetchJson` in `lib/api/client.ts` handles JSON responses and 204 No Content (e.g. document delete).

**Client server state — `lib/queries/`**  
TanStack React Query hooks (`useQuery`, `useMutation`). Query keys in `lib/queries/keys.ts`. Mutations invalidate related keys; do not use `router.refresh()` for server-state updates.

### Request flow

```
Server component (first paint)
  → lib/data/           direct Supabase read
  → pass initialData to client query component

Client component (interactive / live updates)
  → lib/queries/        useQuery / useMutation
  → lib/api/            fetch to app/api route handlers
  → lib/data/           route handler delegates here
  → Supabase + RLS
```

### When implementing data features

1. Add or extend functions in `lib/data/` first.
2. Expose via a route handler under `app/api/` if the client needs it.
3. Add the path to `lib/api/routes.ts`, a fetch helper in `lib/api/`, and a hook in `lib/queries/`.
4. Server pages fetch initial data with `lib/data/` and pass it as `initialData` to query hooks.
5. After mutations, invalidate the relevant query keys (e.g. upload/delete → `documents`, chat query → `chat` + `usage`).
6. Do not call `fetch("/api/...")` directly from components — use `lib/api/` + `lib/queries/`.

## Env

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-side ingest/message writes only), `GROQ_API_KEY` (LLM + OCR vision), `GEMINI_API_KEY` (embeddings only), `NEXT_PUBLIC_APP_URL`, `DAILY_QUERY_LIMIT`, `DAILY_UPLOAD_LIMIT`, `HOURLY_UPLOAD_LIMIT`.

Never commit secrets or expose the service role key to the client.

## Production data (non-negotiable)

- Do not add mock, fake, sample, or hardcoded user data to app pages or components.
- All user-facing state comes from `lib/data/` (Supabase + RLS), route handlers under `app/api/`, or React Query hooks backed by those routes.
- Server components call `lib/data/` directly for the initial render and pass results as `initialData` to client query components.
- Client components read and mutate server state via `lib/queries/` hooks — not raw `fetch`, not `router.refresh()`.
- When there is no data yet, show empty states — never placeholder rows, messages, or documents.
- Static marketing copy on the public landing page is fine; authenticated app UI must reflect real user data only.
- Mark authenticated layouts/pages `dynamic = "force-dynamic"` (or equivalent) so cached shells never show stale user data.
- Wrap the app in `QueryProvider` (root layout). Do not create ad-hoc `QueryClient` instances in individual components.

## Styling (do not substitute)

Theme and design tokens live in `tailwind.config.ts`, not in CSS.

- Colors, fonts, radii, shadows, and decorative backgrounds belong in `tailwind.config.ts` (`theme.extend`).
- Style UI with Tailwind utility classes and shadcn components in `components/ui/`.
- Join class names with `classnames` (`import classNames from "classnames"`). Do not use `clsx`, `tailwind-merge`, or a `cn()` helper.
- `app/globals.css` is the Tailwind entry only: `@import` Tailwind / shadcn / animation CSS, `@config "../tailwind.config.ts"`, and the `dark` variant. Do not put design tokens, `:root` variables, `@theme` blocks, `@layer base` branding, or custom CSS classes there.
- Do not introduce new global stylesheets. Do not use inline `style={{}}` for theme values.
- Keep `components.json` pointing at `tailwind.config.ts` with `cssVariables: false`. If `npx shadcn add` writes tokens into `globals.css`, move them into `tailwind.config.ts` and revert `globals.css`.

```
❌ :root { --primary: ... } and @theme in app/globals.css
✅ theme.extend.colors.primary in tailwind.config.ts, then className="bg-primary"
```

## When implementing

- Import with named imports, never namespace or default: `import { type ComponentProps } from "react"`, not `import * as React from "react"` or `import React from "react"`. Same for every other package, except `import classNames from "classnames"`.
- Export components as named arrow functions at the definition: `export const Label = () => {}`, not `function Label()`, `export function Label()`, or `export { Label }`. Do not default-export shared components. Next.js `page.tsx` / `layout.tsx` / route files use `const Home = () => {}` plus `export default Home`.
- Read `node_modules/next/dist/docs/` before using Next.js APIs.
- Prefer existing files and the structure above over new top-level folders.
- Implement reads and writes in `lib/data/` first; route handlers should delegate to those functions. Client-facing reads/writes go through `lib/api/` + `lib/queries/`.
- Add new API paths to `lib/api/routes.ts` before using them in fetch helpers.
- Ground every chat answer in retrieved chunks; never invent document contents.
- When deleting a document, cascade-purge chunks, vectors, and connections. No file storage to clean up.
- Keep free-tier cost in mind: no unbounded embedding/LLM loops, no extra paid services.
- Log RAG pipeline steps with structured JSON from `lib/rag/` so Vercel function logs remain useful for debugging.
- Use Supabase Dashboard to verify data and RLS; use Vercel Logs for API failures — do not add LangSmith or LangChain for observability.
- Roadmap not yet built: tagging/auto-categorisation, knowledge-graph viz, scheduled digests, browser extension, mobile, public API/SDK. Do not implement these unless asked.
