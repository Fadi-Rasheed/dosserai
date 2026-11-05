-- Enable pgvector
create extension if not exists vector;

-- Documents (metadata only — no stored files)
create table documents (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users not null,
  filename           text not null,
  summary            text,
  summary_embedding  vector(1536),
  uploaded_at        timestamptz default now() not null
);

-- Chunks with embeddings
create table chunks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  doc_id      uuid references documents(id) on delete cascade not null,
  content     text not null,
  embedding   vector(1536) not null,
  chunk_index int not null,
  metadata    jsonb default '{}'::jsonb
);

-- Cross-document connections
create table doc_connections (
  doc_id         uuid references documents(id) on delete cascade not null,
  related_doc_id uuid references documents(id) on delete cascade not null,
  similarity     float not null,
  primary key (doc_id, related_doc_id),
  check (doc_id <> related_doc_id)
);

-- Chat history
create table messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  role       text not null,
  content    text not null,
  sources    jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null
);

-- Usage tracking (rate limiting)
create table usage (
  user_id       uuid references auth.users not null,
  date          date default current_date not null,
  queries_count int default 0 not null,
  primary key (user_id, date)
);

-- Vector similarity indexes
create index chunks_embedding_idx on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index documents_summary_embedding_idx on documents using ivfflat (summary_embedding vector_cosine_ops) with (lists = 100);

create index documents_user_id_idx on documents (user_id);
create index chunks_doc_id_idx on chunks (doc_id);
create index chunks_user_id_idx on chunks (user_id);
create index doc_connections_doc_id_idx on doc_connections (doc_id);
create index messages_user_id_idx on messages (user_id);

-- Row Level Security
alter table documents       enable row level security;
alter table chunks          enable row level security;
alter table doc_connections enable row level security;
alter table messages        enable row level security;
alter table usage           enable row level security;

create policy "Users see own documents"
  on documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users see own chunks"
  on chunks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users see own connections"
  on doc_connections for all
  using (
    auth.uid() = (select user_id from documents where id = doc_id)
  )
  with check (
    auth.uid() = (select user_id from documents where id = doc_id)
  );

create policy "Users see own messages"
  on messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users see own usage"
  on usage for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
