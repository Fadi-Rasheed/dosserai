-- Usage increment: service role only (clients cannot pass arbitrary p_daily_limit)

drop function if exists increment_query_usage(int);

create or replace function increment_query_usage(
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
  v_role text;
begin
  v_role := coalesce(current_setting('request.jwt.claim.role', true), '');

  if v_role <> 'service_role' then
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

revoke all on function increment_query_usage(uuid, int) from public;
grant execute on function increment_query_usage(uuid, int) to service_role;
