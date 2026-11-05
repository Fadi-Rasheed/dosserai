# Cross-Document Connections

Cross-document connections are a core product feature. Related documents are discovered automatically at upload time and surfaced at query time and on the dashboard.

## Overview

```mermaid
flowchart TB
  subgraph uploadTime [Upload time]
    Summary[Document summary from Groq]
    SumEmbed[Embed summary 1536d]
    Compare[Cosine vs other user docs]
    Upsert[upsertDocConnections]
    SumEmbed --> Compare --> Upsert
    Summary --> SumEmbed
  end

  subgraph queryTime [Query time]
    Retrieve[Retrieved chunks from multiple docs]
    Lookup[getConnectionsBetweenDocs]
    Surface[Include in assistant sources JSON]
    Retrieve --> Lookup --> Surface
  end

  subgraph dashboardTime [Dashboard]
    Featured[Most recent doc on page]
    Graph[ConnectionGraph component]
    Featured --> Graph
  end

  Upsert --> DocConnTable[(doc_connections)]
  DocConnTable --> Lookup
  DocConnTable --> Graph
```

## Upload-time connection logic

When a document is ingested, after the summary is generated and embedded:

```mermaid
flowchart LR
  NewDoc[New doc summary_embedding] --> FetchOthers[Fetch other user docs with summary_embedding]
  FetchOthers --> Cosine[cosineSimilarity per candidate]
  Cosine --> Filter["Keep similarity >= 0.3"]
  Filter --> TopN[Take top 5]
  TopN --> Bidirectional[Upsert bidirectional rows]
  Bidirectional --> ConnTable[(doc_connections)]
```

Configuration from `lib/config.ts`:

| Constant | Value |
| --- | --- |
| `DOC_CONNECTION_SIMILARITY_THRESHOLD` | 0.3 |
| `TOP_DOC_CONNECTIONS` | 5 |

Each match creates **two rows** (A→B and B→A) with the same similarity score. Upsert uses `onConflict: doc_id,related_doc_id`.

Writes use the service role client. A database trigger (`doc_connections_same_user`) ensures both documents belong to the same user.

## Query-time connection logic

During `submitChatQuery`, after vector search and reranking:

```mermaid
flowchart LR
  Chunks[Retrieved chunks] --> DocIds[Unique doc IDs]
  DocIds --> QueryConn["SELECT doc_connections WHERE both IDs in set"]
  QueryConn --> Dedupe[Deduplicate pairs]
  Dedupe --> Attach[Attach to assistant message sources.connections]
```

Connections are only returned when chunks from **two or more documents** appear in the retrieval set. Stored in `messages.sources` JSONB alongside citations.

## Dashboard display

```mermaid
flowchart LR
  Page[DashboardPage server] --> DocsPage[getDocumentsPage]
  DocsPage --> FirstDoc[First doc on current page]
  FirstDoc --> GetConn[getDocumentConnections]
  GetConn --> Graph[ConnectionGraph sidebar]
  DocsPage --> ListItems[DocumentListItem rows]
  ListItems --> Badge[relatedCount badge]
```

- **Connection graph** — shown for the most recent document on the current page (featured doc).
- **Badge** — each list row shows `relatedCount` from a Supabase aggregate on `doc_connections`.

## API

| Method | Path | Function |
| --- | --- | --- |
| GET | `/api/connections/[docId]` | `getDocumentConnections` |

## Key files

- `lib/data/connections.ts` — `upsertDocConnections`, `getDocumentConnections`
- `lib/data/chat.ts` — `getConnectionsBetweenDocs`
- `lib/data/documents.ts` — calls `upsertDocConnections` after ingest
- `lib/rag/search.ts` — `cosineSimilarity`
- `components/dashboard/ConnectionGraph.tsx`
- `components/dashboard/DocumentListItem.tsx`
- `app/api/connections/[docId]/route.ts`
- `supabase/migrations/003_security_hardening.sql` — same-user trigger
