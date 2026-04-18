create or replace view public.live_grants as
select *
from public.grants
where is_active = true
  and (deadline is null or deadline >= current_date)
  and source is not null;
