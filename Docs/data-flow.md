# Data Flow

Dosserai uses a **hybrid SSR + React Query** model: fast first paint from the server, live updates from the client cache after mutations.

## Three-layer pattern

```mermaid
flowchart TB
  subgraph serverPaint [Server component first paint]
    SC[Server page component]
    DataRead[lib/data direct Supabase read]
    InitialData[pass initialData prop]
    SC --> DataRead --> InitialData
  end

  subgraph clientLive [Client component live updates]
    CC[Client component]
    Hooks[lib/queries useQuery useMutation]
    API[lib/api fetchJson]
    RH[app/api route handler]
    DataWrite[lib/data business logic]
    CC --> Hooks --> API --> RH --> DataWrite
  end

  InitialData --> CC
  DataWrite --> Supabase[(Supabase Postgres)]
  DataRead --> Supabase
```

| Layer | Location | Role |
| --- | --- | --- |
| Data access | `lib/data/` | Supabase reads/writes with RLS. Server-only — never imported from client components. |
| HTTP client | `lib/api/` | Typed browser fetch helpers. Paths in `routes.ts`, shared JSON handling in `client.ts`. |
| Server state | `lib/queries/` | React Query hooks, query keys, cache invalidation after mutations. |
| Provider | `components/layout/QueryProvider.tsx` | `QueryClientProvider` in root layout. |

## Request sequence (client mutation)

```mermaid
sequenceDiagram
  participant UI as ClientComponent
  participant RQ as lib/queries
  participant API as lib/api
  participant Route as app/api route
  participant Data as lib/data
  participant DB as Supabase

  UI->>RQ: useMutation.mutate
  RQ->>API: fetchJson apiRoutes
  API->>Route: HTTP request
  Route->>Data: delegate
  Data->>DB: Supabase query or RPC
  DB-->>Data: result
  Data-->>Route: typed response
  Route-->>API: JSON
  API-->>RQ: parsed data
  RQ->>RQ: invalidate query keys
  RQ-->>UI: updated cache
```

## Supabase client split

```mermaid
flowchart LR
  subgraph sessionClient [Session client anon key]
    Reads[SELECT documents chunks messages connections usage]
    Delete[DELETE own documents]
    RPC[increment_query_usage RPC]
  end

  subgraph serviceClient [Service role key server only]
    Ingest[INSERT documents chunks doc_connections]
    Messages[INSERT messages]
  end

  Session[getAuthenticatedUser] --> sessionClient
  Service[createSupabaseServiceClient] --> serviceClient
```

| Operation | Client | Notes |
| --- | --- | --- |
| List/read documents, chunks, messages | Session | RLS-scoped to `auth.uid()` |
| Delete document | Session | RLS allows DELETE on own rows; cascades chunks and connections |
| Upload ingest writes | Service role | `user_id` always from authenticated session, never from request body |
| Chat message writes | Service role | Same — session provides `user_id` |
| Query usage increment | Service role RPC | Atomic daily cap in `increment_query_usage` (`p_user_id` from session) |

The service role key is never exposed to the browser. RLS policies in `001_initial_schema.sql` block client INSERT/UPDATE on ingest-related tables.

## Conventions

- Server components load real data via `lib/data/` and pass it as `initialData` to client query components.
- Client components never call `fetch("/api/...")` directly — use hooks from `lib/queries/`.
- After mutations (upload, delete, chat query), invalidate related query keys instead of `router.refresh()`.
- All API paths are defined once in `lib/api/routes.ts` (`apiRoutes`).

## Example: chat page wiring

```mermaid
flowchart LR
  ChatPage["ChatPage.tsx server"] --> getChatHistory
  ChatPage --> getDocuments
  ChatPage --> getUsageSummary
  getChatHistory --> initialData
  getDocuments --> initialData
  getUsageSummary --> initialData
  initialData --> ChatHistoryPanel
  initialData --> ChatComposer
  ChatHistoryPanel --> useChatHistory
  ChatComposer --> useSubmitChatQuery
```

## Adding a new client-facing endpoint

1. Implement `lib/data/foo.ts`
2. Add `app/api/foo/route.ts` delegating to `lib/data/`
3. Add path to `lib/api/routes.ts`
4. Add `fetchFoo` in `lib/api/foo.ts`
5. Add `useFoo` / `useUpdateFoo` in `lib/queries/foo.ts` with keys in `lib/queries/keys.ts`

## Key files

- `lib/data/documents.ts`, `lib/data/chat.ts`, `lib/data/usage.ts`, `lib/data/connections.ts`
- `lib/api/routes.ts`, `lib/api/client.ts`, `lib/api/handleRouteError.ts`
- `lib/queries/keys.ts`, `lib/queries/documents.ts`, `lib/queries/chat.ts`, `lib/queries/usage.ts`
- `lib/supabase/server.ts`
- `supabase/migrations/001_initial_schema.sql`
