# Auth and Middleware

Authentication uses Supabase Auth with cookie-based sessions. Middleware refreshes the session on every matched request and gates protected routes.

## Middleware decision flow

```mermaid
flowchart TD
  Request[Incoming request] --> Refresh[Supabase getUser refresh session]
  Refresh --> CheckPath{Protected path?}
  CheckPath -->|No| Continue[NextResponse.next]
  CheckPath -->|Yes| HasUser{User authenticated?}
  HasUser -->|Yes| LoginCheck{Path is /login?}
  HasUser -->|No| IsAPI{Path starts with /api/?}
  IsAPI -->|Yes| Return401[401 JSON]
  IsAPI -->|No| RedirectLogin["Redirect /login?next=path"]
  LoginCheck -->|Yes| RedirectDash[Redirect /dashboard]
  LoginCheck -->|No| Continue
```

### Protected paths

**Pages:** `/dashboard`, `/upload`, `/chat`

**APIs:** `/api/documents`, `/api/chat`, `/api/connections`, `/api/usage`

Matcher excludes static assets, Serwist routes, manifest, offline page, and favicon.

## Supabase clients

```mermaid
flowchart LR
  subgraph browser [Browser]
    BrowserClient["lib/supabase/client.ts"]
    LoginForm[LoginForm signInWithPassword]
    SignOut[SignOutButton signOut]
  end

  subgraph server [Server]
    ServerClient["lib/supabase/server.ts session"]
    ServiceClient["createSupabaseServiceClient"]
    MW[middleware.ts SSR client]
  end

  LoginForm --> BrowserClient
  SignOut --> BrowserClient
  MW --> ServerClient
  ServiceClient --> IngestAndMessages[Ingest and message writes]
  ServerClient --> ReadsAndDelete[Reads and document delete]
```

| Client | File | Use |
| --- | --- | --- |
| Browser | `lib/supabase/client.ts` | Login, sign-out |
| Server (session) | `lib/supabase/server.ts` | RLS-scoped reads, `getAuthenticatedUser`, `AuthError` |
| Service role | same file | Ingest and message writes only |

## Login sequence

```mermaid
sequenceDiagram
  participant User
  participant Form as LoginForm
  participant SB as Supabase browser client
  participant RQ as React Query
  participant Router as Next.js router
  participant Safe as safeRedirect

  User->>Form: email + password
  Form->>SB: signInWithPassword
  SB-->>Form: session cookies set
  Form->>RQ: invalidate documents chat usage keys
  Form->>Router: push getSafeRedirectPath next
  Router-->>User: dashboard or safe next path
```

Post-login redirect uses `getSafeRedirectPath` from `lib/auth/safeRedirect.ts` to block open redirects. Default destination is `/dashboard`.

If an authenticated user visits `/login`, middleware redirects them to `/dashboard` immediately.

## Sign-out sequence

```mermaid
sequenceDiagram
  participant User
  participant Btn as SignOutButton
  participant SB as Supabase browser client
  participant Router as Next.js router

  User->>Btn: click Sign out
  Btn->>SB: signOut
  Btn->>Router: push /login
```

## Data isolation

```mermaid
flowchart TB
  User[Authenticated user auth.uid] --> RLS[Row Level Security]
  RLS --> Documents[documents user_id]
  RLS --> Chunks[chunks user_id]
  RLS --> Messages[messages user_id]
  RLS --> Usage[usage user_id]
  RLS --> Connections[doc_connections via doc owner]
  RLS --> MatchRPC[match_chunks RPC filters auth.uid]
```

Defense in depth:

- Every user-owned table has `user_id`.
- RLS policies restrict SELECT (and DELETE on documents) to `auth.uid()`.
- Vector search RPC `match_chunks` filters `c.user_id = auth.uid()`.
- `doc_connections` trigger ensures both linked documents belong to the same user.
- Service-role writes always set `user_id` from the authenticated session, never from client input.

## Key files

- `middleware.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/auth/safeRedirect.ts`
- `app/(auth)/login/LoginForm.tsx`
- `components/layout/SignOutButton.tsx`
- `supabase/migrations/003_security_hardening.sql`
