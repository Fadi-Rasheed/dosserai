create or replace function match_chunks(
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
