# Dosserai Documentation

Architecture and feature diagrams for the Dosserai codebase. All diagrams use [Mermaid](https://mermaid.js.org/) and render on GitHub and in most Markdown editors.

## How to read these docs

1. Start with [architecture.md](./architecture.md) for the big picture.
2. Read the cross-cutting docs for shared patterns (data flow, auth, database, connections).
3. Dive into individual feature docs for user flows and file maps.

## Architecture

| Doc | Description |
| --- | --- |
| [architecture.md](./architecture.md) | System context, route groups, external services, observability |
| [data-flow.md](./data-flow.md) | SSR + React Query hybrid, three-layer client/server pattern |
| [auth-and-middleware.md](./auth-and-middleware.md) | Session management, route protection, login/sign-out |
| [database-schema.md](./database-schema.md) | ER diagram, indexes, RLS policies, usage RPC |
| [cross-document-connections.md](./cross-document-connections.md) | Upload-time and query-time connection logic |

## Features

| Doc | Description |
| --- | --- |
| [features/landing-page.md](./features/landing-page.md) | Public marketing page with auth-aware CTAs |
| [features/login.md](./features/login.md) | Email/password sign-in and safe redirect |
| [features/dashboard.md](./features/dashboard.md) | Document list, pagination, delete, connection graph |
| [features/upload.md](./features/upload.md) | In-memory ingest pipeline (parse → chunk → embed) |
| [features/chat.md](./features/chat.md) | RAG query pipeline with citations and history |
| [features/usage-meter.md](./features/usage-meter.md) | Daily query limit display in app shell |
| [features/pwa-offline.md](./features/pwa-offline.md) | Serwist service worker, manifest, offline fallback |
