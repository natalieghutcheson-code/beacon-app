# Beacon grants sync setup

This is the minimum setup to:

1. stop showing stale grants in Beacon
2. import fresh Grants.gov opportunities every day
3. preserve Beacon-written fields like `beacon_read`

## 1. Add database columns in Supabase

Run this in the Supabase SQL editor:

```sql
alter table public.grants
  add column if not exists source text,
  add column if not exists source_opportunity_id text,
  add column if not exists source_opportunity_number text,
  add column if not exists source_status text,
  add column if not exists source_last_updated_at date,
  add column if not exists last_synced_at timestamptz,
  add column if not exists is_active boolean default true,
  add column if not exists raw_source jsonb;

create unique index if not exists grants_source_opportunity_id_idx
  on public.grants (source_opportunity_id);

update public.grants
set is_active = false
where deadline is not null
  and deadline < current_date;
```

What this does:

- `is_active` lets Beacon hide expired opportunities without deleting history
- `source_*` fields tell you which rows came from Grants.gov
- `raw_source` keeps the official payload for debugging
- the unique index makes upserts work safely

## 2. Add Vercel environment variables

In Vercel project settings, add:

- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `GRANTS_SYNC_MAX_RECORDS` = `100`
- `GRANTS_SYNC_ROWS_PER_PAGE` = `20`

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` is already used by the app
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed in the browser
- `CRON_SECRET` can be any long random string

## 3. Redeploy

After the environment variables are saved:

1. push the repo changes
2. redeploy on Vercel

The cron in `vercel.json` is set to run once per day at `13:00 UTC`.
That is usually `9:00 AM Eastern` during daylight saving time.

## 4. Run the first sync manually

After deploy, trigger the sync once so you do not have to wait for tomorrow's cron run.

Use a request like:

```bash
curl -X POST https://beacon-app-two.vercel.app/api/cron/grants-sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Success response should look like:

```json
{
  "ok": true,
  "fetched": 42,
  "imported": 42,
  "deactivated": 5,
  "skipped": 0
}
```

## 5. Recommended cleanup pass for existing hand-entered rows

In the Supabase Table Editor:

1. keep the strongest rows you want as curated examples
2. mark expired rows inactive by setting `is_active = false`
3. if you want to preserve a curated row, leave its `source` empty
4. do not delete rows unless you are sure you do not want them

## 6. Important product rule

The sync route intentionally does **not** write to these Beacon-owned fields:

- `beacon_read`
- `good_fit_for`

That means you can keep layering your own intelligence on top of live source data.
