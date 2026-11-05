# Dosserai 🗂️

> Your personal AI-powered knowledge base. Upload, extract, ask anything.

**Dosserai** lets you upload any document — contracts, invoices, notes, scanned files — and query the extracted knowledge in natural language. The original file is never stored: it is parsed, chunked, embedded, and discarded. Your dashboard shows only each file's name and upload date. Ask _"what are the payment terms in my freelance contract?"_ or _"do I have anything due this week?"_ and get grounded answers with source citations, across all your documents at once.

Live at: [dosserai.com](https://dosserai.com) _(coming soon)_

---

## Why Dosserai?

Most people drown in documents. PDFs scatter across Downloads folders, invoices get buried in email, contracts are forgotten the moment they're signed. Dosserai turns uploads into searchable knowledge you can talk to — without keeping the original files on our servers. That reduces privacy risk and complexity: we store extracted text and vectors, not your PDFs.

The name is a blend of **dossier** (a personal collection of documents) and **AI** — because that's exactly what it is.

---

## Features

- **Natural language querying** — ask questions across everything you've uploaded
- **Cross-document connections** — Dosserai finds relationships between documents automatically at upload time
- **Multi-format support** — PDF, DOCX, TXT, Markdown, and scanned images (via OCR)
- **Source citations** — every answer links back to the exact document and chunk it came from
- **Translation** — query and receive answers in any language
- **No original file storage** — uploads are processed in memory; only filename, upload date, summary, and vector chunks persist. Originals cannot be downloaded or viewed again.
- **Multi-user with full data isolation** — each user's documents are siloed at the database level via Postgres RLS; the AI physically cannot access another user's data
- **Persistent chat history** — your conversations and their sources are saved across sessions
- **$0/month infrastructure** — built entirely on free tiers
- **Built-in observability** — Vercel Logs + Analytics for app/API; Supabase Dashboard for data and auth (no LangSmith)

---

## Architecture

### Overview

```
User (browser)
    ↓
Vercel  (Next.js App + API Routes)     ← Vercel Logs + Analytics
    ↓  ← Auth check via middleware
Supabase Auth  ← validates session
    ↓
┌─────────────────────────────────────┐
│  Supabase                           │  ← Supabase Dashboard
│  └── PostgreSQL + pgvector  (chunks)│     (data, auth, RLS, SQL)
└─────────────────────────────────────┘
    ↓
Groq API       (LLaMA 3.3 70B — inference)
Gemini API     (gemini-embedding-001 — embeddings, AI Studio free tier)
Groq API       (openai/gpt-oss-120b chat + Llama 4 Scout vision OCR)
```

### Document Ingestion Pipeline

When you upload a file:

```
1. Frontend sends file → POST /api/documents/upload
2. Text extracted in memory (file bytes discarded after parsing):
   └── PDF      → pdf-parse
   └── DOCX     → mammoth
   └── Images   → Groq Llama 4 Scout vision (OCR)
   └── Markdown → marked
3. Semantic chunking (~500 tokens, 100 token overlap)
4. Each chunk embedded → Gemini gemini-embedding-001 (1536d)
5. Chunks + embeddings stored in PostgreSQL with pgvector
6. Document row saved: filename, uploaded_at, summary (no original file)
7. Document summary embedded → cross-document similarity computed
8. doc_connections table updated with top-N related documents
```

### Query Pipeline

When you ask a question:

```
1. User question embedded into same 1536d vector space
2. pgvector cosine similarity search → top-K chunks across ALL user docs
3. Chunks re-ranked by relevance
4. Context prompt assembled with chunks + source metadata
5. Groq (LLaMA 3.3 70B) generates grounded answer
6. Response returned with source citations + cross-doc connections
7. Message + sources saved to chat history
```

### Cross-Document Connections

This is Dosserai's killer feature. At upload time, each document's summary is embedded and compared against all existing documents. Related documents are stored in a `doc_connections` table. At query time, when chunks from multiple documents appear in results, their relationships are surfaced explicitly in the response — connecting the dots you'd never find manually.

---

## Database Schema

```sql
-- Enable pgvector
create extension vector;

-- Documents (metadata only — no stored files)
create table documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users,
  filename     text,
  summary      text,
  uploaded_at  timestamptz default now()
);

-- Chunks with embeddings
create table chunks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users,
  doc_id      uuid references documents(id) on delete cascade,
  content     text,
  embedding   vector(1536),
  chunk_index int,
  metadata    jsonb
);

-- Cross-document connections
create table doc_connections (
  doc_id         uuid references documents(id) on delete cascade,
  related_doc_id uuid references documents(id) on delete cascade,
  similarity     float,
  primary key (doc_id, related_doc_id)
);

-- Chat history
create table messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users,
  role       text,
  content    text,
  sources    jsonb,
  created_at timestamptz default now()
);

-- Usage tracking (rate limiting)
create table usage (
  user_id      uuid references auth.users,
  date         date default current_date,
  queries_count int default 0,
  primary key (user_id, date)
);

-- Vector similarity index
create index on chunks using ivfflat (embedding vector_cosine_ops);

-- Row Level Security — users only ever see their own data
alter table documents      enable row level security;
alter table chunks         enable row level security;
alter table doc_connections enable row level security;
alter table messages       enable row level security;

create policy "Users see own documents"       on documents       for all using (auth.uid() = user_id);
create policy "Users see own chunks"          on chunks          for all using (auth.uid() = user_id);
create policy "Users see own connections"     on doc_connections for all using (auth.uid() = (select user_id from documents where id = doc_id));
create policy "Users see own messages"        on messages        for all using (auth.uid() = user_id);
```

---

## Tech Stack

| Layer               | Choice                                      | Why                                                |
| ------------------- | ------------------------------------------- | -------------------------------------------------- |
| Frontend            | Next.js (App Router) + shadcn/ui + Tailwind | Full-stack, fast iteration                         |
| Client server state | TanStack React Query                        | Cached API state, mutations, invalidation          |
| API                 | Next.js API Routes                          | Co-located with frontend, no extra infra           |
| Auth                | Supabase Auth + RLS                         | Free, DB-integrated, secure by default             |
| Vector DB           | pgvector on Supabase                        | One DB for everything — no Pinecone needed         |
| Upload handling     | In-memory / request-scoped                  | No object storage — originals never persisted      |
| Embeddings          | Gemini `gemini-embedding-001`               | 1536d, Google AI Studio free tier                  |
| LLM                 | Groq `openai/gpt-oss-120b`                  | Free tier, fast, great for RAG                     |
| OCR                 | Groq Llama 4 Scout vision                   | Handles scanned photos and image-based PDFs        |
| Upload processing   | Next.js API route (`/api/documents/upload`) | In-memory parse → chunk → embed; no object storage |
| RAG                 | Custom `lib/rag/` (direct API calls)        | No LangChain — full control, free-tier friendly    |
| Observability       | Vercel Logs + Analytics, Supabase Dashboard | Two layers, no LangSmith or extra APM              |
| Deployment          | Vercel                                      | Free hobby tier, global CDN                        |

---

## API Routes

Route paths are defined once in `lib/api/routes.ts` (`apiRoutes`). Client code must import from there — do not hardcode `/api/...` strings in components or hooks.

```
/api
  /documents
    POST   /upload        → ingest file, trigger processing pipeline
    GET    /list          → fetch user documents (filename + uploaded_at only)
    DELETE /[id]          → remove document + purge all chunks + vectors (204 No Content)
  /chat
    POST   /query         → RAG query: embed → search → rerank → generate
    GET    /history       → full conversation history with sources
  /connections
    GET    /[docId]       → cross-document relationships for a given doc
  /usage
    GET    /              → today's query count vs. daily limit
```

---

## Client / server data flow

Dosserai uses a **hybrid SSR + React Query** model: fast first paint from the server, live updates from the client cache after mutations.

```
┌─────────────────────────────────────────────────────────────┐
│  Server component (page)                                    │
│    lib/data/  ──→  Supabase + RLS  (initial read)           │
│    pass result as initialData ↓                             │
├─────────────────────────────────────────────────────────────┤
│  Client component                                           │
│    lib/queries/  useQuery / useMutation                     │
│         ↓                                                   │
│    lib/api/  fetchJson + apiRoutes                          │
│         ↓                                                   │
│    app/api/  route handler                                  │
│         ↓                                                   │
│    lib/data/  ──→  Supabase + RLS                           │
└─────────────────────────────────────────────────────────────┘
```

| Layer            | Location                       | Role                                                                                    |
| ---------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| **Data access**  | `lib/data/`                    | Supabase reads/writes with RLS. Used by route handlers and server components only.      |
| **HTTP client**  | `lib/api/`                     | Typed browser fetch helpers. Paths in `routes.ts`, shared JSON handling in `client.ts`. |
| **Server state** | `lib/queries/`                 | React Query hooks, query keys, cache invalidation after mutations.                      |
| **Provider**     | `components/QueryProvider.tsx` | `QueryClientProvider` in root layout.                                                   |

**Conventions:**

- Server components load real data via `lib/data/` and pass it as `initialData` to client query components.
- Client components never call `fetch("/api/...")` directly — use hooks from `lib/queries/`.
- After mutations (upload, delete, chat query), invalidate related query keys instead of `router.refresh()`.
- Do not import `lib/data/` from client components.

**Example — adding a new client-facing endpoint:**

1. Implement `lib/data/foo.ts`
2. Add `app/api/foo/route.ts` delegating to `lib/data/`
3. Add path to `lib/api/routes.ts`
4. Add `fetchFoo` in `lib/api/foo.ts`
5. Add `useFoo` / `useUpdateFoo` in `lib/queries/foo.ts` with keys in `lib/queries/keys.ts`

---

## Project Structure

```
dosserai/
├── app/
│   ├── (app)/              ← authenticated shell (sidebar)
│   │   ├── dashboard/      ← document list (filename + upload date)
│   │   ├── chat/           ← main query interface
│   │   └── upload/         ← drag-and-drop uploader
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── api/                ← route handlers (delegate to lib/data/)
│   └── layout.tsx          ← wraps app in QueryProvider
├── components/
│   ├── ui/                 ← shadcn components
│   ├── QueryProvider.tsx   ← TanStack React Query provider
│   ├── ChatComposer.tsx
│   ├── ChatHistoryPanel.tsx
│   ├── DashboardDocuments.tsx
│   ├── DocumentListItem.tsx
│   ├── ConnectionGraph.tsx ← cross-doc relationship view
│   └── SourceCitation.tsx
├── lib/
│   ├── api/                ← client HTTP layer
│   │   ├── client.ts       ← fetchJson, ApiError (incl. 204 handling)
│   │   ├── routes.ts       ← apiRoutes constants (single source of truth)
│   │   ├── chat.ts
│   │   ├── documents.ts
│   │   └── usage.ts
│   ├── queries/            ← React Query hooks + query keys
│   │   ├── keys.ts
│   │   ├── chat.ts
│   │   ├── documents.ts
│   │   └── usage.ts
│   ├── data/               ← server data access (Supabase + RLS)
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── rag/
│   │   ├── chunk.ts        ← semantic chunking
│   │   ├── embed.ts        ← Gemini embeddings
│   │   ├── search.ts       ← pgvector similarity search
│   │   └── generate.ts     ← Groq inference
│   └── parsers/
│       ├── pdf.ts
│       ├── docx.ts
│       └── image.ts        ← Groq vision OCR
├── middleware.ts            ← route protection
└── supabase/
    └── migrations/          ← all SQL schema files
```

**Production data:** Server pages load initial user state from `lib/data/`. Client components subscribe via `lib/queries/` hooks backed by `app/api/` routes. Do not ship mock or hardcoded user data — use empty states until Supabase is wired.

---

## Improvements Borrowed from Loci

After comparing architectures with [Loci](https://locivault.com), Dosserai adopted several ideas:

| Feature                        | Inspired by Loci  | Implementation                                              |
| ------------------------------ | ----------------- | ----------------------------------------------------------- |
| **OCR for scanned documents**  | ✅                | Groq vision in the ingestion pipeline                       |
| **No original file storage**   | ✅ (zero-retain)  | Mandatory — parse in memory, persist chunks + metadata only |
| **Rate limiting per user**     | ✅                | `usage` table with daily query cap                          |
| **Source citations**           | ✅                | Sources stored as JSONB on every message                    |
| **Cross-document connections** | Dosserai original | `doc_connections` table + graph view                        |

Key architectural difference: Loci runs 17 Lambdas on AWS at ~£30/month. Dosserai achieves equivalent core functionality at $0/month by consolidating onto Supabase + Vercel. The trade-off is that Loci is more production-hardened (custom JWT auth, MFA, SAML SSO, DynamoDB rate limiting, public SDKs). Dosserai prioritises simplicity and zero cost for personal and small-team use.

---

## Free Tier Limits

| Resource          | Free Limit      | Comfortably supports     |
| ----------------- | --------------- | ------------------------ |
| Supabase DB       | 500MB           | ~100k document chunks    |
| Groq              | 14,400 req/day  | ~10-20 active users      |
| Vercel            | 100GB bandwidth | Very hard to hit         |
| Gemini embeddings | Free tier       | Rate limits in AI Studio |

---

## Multi-User & Privacy

Dosserai is built multi-tenant from day one:

- Every table has a `user_id` column
- Postgres RLS policies ensure no query can return another user's data — even if the API has a bug
- Original uploads are never persisted — only extracted chunks, embeddings, filename, and upload date
- The AI only ever receives chunks belonging to the authenticated user — it physically cannot see another user's documents
- Rate limiting is per-user to prevent one user exhausting shared API quotas

---

## Observability

Dosserai uses **two complementary observability layers** — not LangSmith, LangChain tracing, or a separate APM. Each layer monitors a different part of the stack:

```
User → Vercel (Next.js + API routes) → Supabase (Postgres + pgvector + Auth)
         ↑ Vercel Logs + Analytics          ↑ Supabase Dashboard
```

### Vercel Logs + Analytics — app and API layer

Use for anything that runs in Next.js route handlers or server components:

- API route errors and stack traces (`/api/documents/upload`, `/api/chat/query`, etc.)
- Serverless timeouts and memory limits during upload processing
- Deploy and build failures
- **Analytics:** page traffic and which routes users visit (product metrics, not RAG debugging)

Structured logs from `lib/rag/` and `lib/data/` (e.g. embed ms, chunks retrieved, generate ms) appear in **Vercel function logs** when emitted from route handlers.

### Supabase Dashboard — data and auth layer

Use for anything stored in or gated by the database:

- Verify rows in `documents`, `chunks`, `messages`, `usage` after upload or chat
- Auth: sign-ups, logins, session issues
- RLS debugging when the UI is empty but the API returns 200
- Database size vs. the 500MB free-tier limit
- Ad-hoc SQL in the SQL Editor to test pgvector queries

### When to look where

| Symptom                                      | Check first                                                         |
| -------------------------------------------- | ------------------------------------------------------------------- |
| HTTP 4xx/5xx, timeout, crash in an API route | **Vercel Logs**                                                     |
| Upload/chat returns 200 but UI is empty      | **Supabase** (rows + RLS)                                           |
| Wrong or missing RAG answers                 | **Supabase** (chunks/embeddings), then **Vercel** (pipeline errors) |
| Login or session problems                    | **Supabase Auth**                                                   |
| Page traffic / usage patterns                | **Vercel Analytics**                                                |
| Approaching storage limits                   | **Supabase** dashboard                                              |

Both are on free tiers and cover the full stack without adding paid observability services.

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-side only

# AI
GROQ_API_KEY=                    # LLM + vision OCR
GEMINI_API_KEY=                  # embeddings only (Google AI Studio)

# App
NEXT_PUBLIC_APP_URL=
DAILY_QUERY_LIMIT=50             # per-user rate limit
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/yourusername/dosserai
cd dosserai

# Install
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Supabase, Groq, and Gemini keys

# Run Supabase migrations
npx supabase db push

# Start dev server
npm run dev
```

---

## Roadmap

- [x] Core RAG pipeline (upload → extract → embed → query)
- [x] Multi-user with RLS isolation
- [x] Cross-document connections
- [x] OCR for scanned documents
- [x] No original file storage (extract-only uploads)
- [x] Rate limiting
- [ ] Document tagging and auto-categorisation
- [ ] Knowledge graph visualisation
- [ ] Scheduled digests ("what's due this week?")
- [ ] Browser extension for auto-capture
- [ ] Mobile app (React Native)
- [ ] Public API + SDK

---

## Name

**Dosserai** = dossier + AI.

A _dossier_ is a personal collection of documents about a subject. Dosserai extracts what matters from those documents and makes it queryable — without keeping the originals.

The `.com` domain was confirmed available and registered at launch.

---

## License

MIT

LLM OPEN AI
orch langchain
vector db pinecone
observability langsmith
memory db postgress
Why nextjs api instead of nodejs app - pros and cons
why using turbopack instead of vite

llama-text-embed-v2:
