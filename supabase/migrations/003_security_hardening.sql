-- Security hardening: split RLS policies, atomic usage RPC, doc_connections integrity trigger

-- Drop blanket FOR ALL policies
drop policy if exists "Users see own documents" on documents;
drop policy if exists "Users see own chunks" on chunks;
drop policy if exists "Users see own connections" on doc_connections;
drop policy if exists "Users see own messages" on messages;
drop policy if exists "Users see own usage" on usage;

-- documents: SELECT + DELETE only (no client INSERT/UPDATE)
create policy "Users select own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users delete own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- chunks: SELECT only
create policy "Users select own chunks"
  on chunks for select
  using (auth.uid() = user_id);

-- doc_connections: SELECT only (via owning doc_id)
create policy "Users select own connections"
  on doc_connections for select
  using (
    auth.uid() = (select user_id from documents where id = doc_id)
  );

-- messages: SELECT only
create policy "Users select own messages"
  on messages for select
  using (auth.uid() = user_id);

-- usage: SELECT only (writes via increment_query_usage RPC)
create policy "Users select own usage"
  on usage for select
  using (auth.uid() = user_id);

-- Atomic query usage increment with daily limit enforcement
create or replace function increment_query_usage(p_daily_limit int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into usage (user_id, date, queries_count)
  values (auth.uid(), current_date, 1)
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

grant execute on function increment_query_usage(int) to authenticated;

-- Defense-in-depth: both docs in a connection must belong to the same user
create or replace function validate_doc_connection_same_user()
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
