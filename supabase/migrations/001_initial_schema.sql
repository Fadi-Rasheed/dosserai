create extension if not exists vector;

-- Tables

-- Documents (metadata only — no stored files)
create table documents (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users not null,
  filename           text not null,
  summary            text,
  summary_embedding  vector(1536),
  uploaded_at        timestamptz default now() not null
);

create table chunks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  doc_id      uuid references documents(id) on delete cascade not null,
  content     text not null,
  embedding   vector(1536) not null,
  chunk_index int not null,
  metadata    jsonb default '{}'::jsonb
);

create table doc_connections (
  doc_id         uuid references documents(id) on delete cascade not null,
  related_doc_id uuid references documents(id) on delete cascade not null,
  similarity     float not null,
  primary key (doc_id, related_doc_id),
  check (doc_id <> related_doc_id)
);

create table messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  role       text not null,
  content    text not null,
  sources    jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null
);

create table usage (
  user_id       uuid references auth.users not null,
  date          date default current_date not null,
  queries_count int default 0 not null,
  primary key (user_id, date)
);

-- Indexes

create index chunks_embedding_idx on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index documents_summary_embedding_idx on documents using ivfflat (summary_embedding vector_cosine_ops) with (lists = 100);

create index documents_user_id_idx on documents (user_id);
create index chunks_doc_id_idx on chunks (doc_id);
create index chunks_user_id_idx on chunks (user_id);
create index doc_connections_doc_id_idx on doc_connections (doc_id);
create index messages_user_id_idx on messages (user_id);

-- Row Level Security
-- Session clients may only read (and delete own documents). All other writes
-- go through the service role server-side.

alter table documents       enable row level security;
alter table chunks          enable row level security;
alter table doc_connections enable row level security;
alter table messages        enable row level security;
alter table usage           enable row level security;

create policy "Users select own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users delete own documents"
  on documents for delete
  using (auth.uid() = user_id);

create policy "Users select own chunks"
  on chunks for select
  using (auth.uid() = user_id);

create policy "Users select own connections"
  on doc_connections for select
  using (
    auth.uid() = (select user_id from documents where id = doc_id)
  );

create policy "Users select own messages"
  on messages for select
  using (auth.uid() = user_id);

create policy "Users select own usage"
  on usage for select
  using (auth.uid() = user_id);

-- Both docs in a connection must belong to the same user
create function validate_doc_connection_same_user()
returns trigger
language plpgsql
as $$
begin
  if (select user_id from documents where id = new.doc_id)
     is distinct from
     (select user_id from documents where id = new.related_doc_id) then
    raise exception 'doc_connection must link documents owned by the same user';
  end if;
  return new;
end;
$$;

create trigger doc_connections_same_user
  before insert or update on doc_connections
  for each row
  execute function validate_doc_connection_same_user();

-- RPC: vector search scoped to the calling user

create function match_chunks(
  query_embedding vector(1536),
  match_count int default 20
)
returns table (
  id uuid,
  doc_id uuid,
  content text,
  chunk_index int,
  similarity float
)
language sql stable
as $$
  select
    c.id,
    c.doc_id,
    c.content,
    c.chunk_index,
    1 - (c.embedding <=> query_embedding) as similarity
  from chunks c
  where c.user_id = auth.uid()
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- RPC: atomic daily query usage increment (service role only)

create function increment_query_usage(
  p_user_id uuid,
  p_daily_limit int
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  -- PostgREST v12+ only exposes the role inside the `request.jwt.claims` JSON.
  if coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    ''
  ) <> 'service_role' then
    raise exception 'Forbidden';
  end if;

  if p_user_id is null or p_daily_limit is null or p_daily_limit < 1 then
    raise exception 'Invalid arguments';
  end if;

  insert into usage (user_id, date, queries_count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, date) do update
    set queries_count = usage.queries_count + 1
    where usage.queries_count < p_daily_limit
  returning queries_count into v_count;

  if v_count is null then
    raise exception 'Daily query limit reached';
  end if;

  return v_count;
end;
$$;

-- Supabase grants EXECUTE on new public functions to anon and authenticated
-- by default, so revoking from public alone is not enough.
revoke all on function increment_query_usage(uuid, int) from public, anon, authenticated;
grant execute on function increment_query_usage(uuid, int) to service_role;
