# Beacon live grants display layer

This is the simple scalable setup:

- `grants` stays your raw source table
- `live_grants` becomes the website-facing display layer
- the app reads from `live_grants`, not from `grants`

## Why this is better

You do not have to keep cleaning up old rows by hand.

Instead:

- raw grants can stay in the database
- synced grants can keep history
- the website only shows rows that pass your display rules

## The display rules

The `live_grants` view only includes grants where:

- `is_active = true`
- `deadline is null or deadline >= current_date`
- `source is not null`

In plain English:

- the grant is marked active
- the deadline is still live, or no deadline is available yet
- the row came from a real source pipeline instead of an old manual seed row

## What to run in Supabase

Open the SQL Editor in Supabase and run:

```sql
create or replace view public.live_grants as
select *
from public.grants
where is_active = true
  and (deadline is null or deadline >= current_date)
  and source is not null;
```

## What changed in the app

The app now reads from `live_grants` for:

- Discover page list
- Grant detail page

That means the raw `grants` table can stay messy, but the public UI stays clean.

## Important note

Your sync job should still write to `grants`.

The view is only for reading.
