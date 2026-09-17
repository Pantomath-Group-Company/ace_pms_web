-- ============================================================================
-- ACE PMS — Supabase schema (idempotent). Paste into Supabase → SQL Editor
-- and Run. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null,          -- Product decks | Monthly factsheets | Compliance & disclosures | Forms
  strategy    text,
  file_path   text,                   -- path in the 'documents' storage bucket
  file_name   text,
  file_type   text,
  uploaded_by text,
  seeded      boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.articles (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null default 'Article',   -- Article | Blog | Media
  category     text not null,
  title        text not null,
  summary      text not null,
  body         text,
  read_time    text,
  link         text,
  published_by text,
  seeded       boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists public.client_onboarding (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  email      text not null,
  mobile     text not null,
  pan        text not null,
  notes      text,
  documents  jsonb not null default '[]'::jsonb,  -- [{key,label,path,fileName}]
  status     text not null default 'new',
  created_at timestamptz not null default now()
);

-- One month-end NAV series per strategy, driving the growth chart on the Home
-- and Strategies pages. Uploaded from the Console (parsed from an Excel file).
create table if not exists public.strategy_nav (
  strategy_id text primary key,                    -- multicap | tentrillion | multiasset
  since       date not null,                       -- inception (first month)
  as_of       date not null,                       -- latest month
  labels      jsonb not null default '[]'::jsonb,  -- ["Aug 2018", ...]
  points      jsonb not null default '[]'::jsonb,  -- [[strategyRebased, benchmarkRebased], ...]
  uploaded_by text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.documents         enable row level security;
alter table public.articles          enable row level security;
alter table public.client_onboarding enable row level security;
alter table public.strategy_nav      enable row level security;

-- Public site content: anyone may read
drop policy if exists "documents public read" on public.documents;
create policy "documents public read" on public.documents for select using (true);

drop policy if exists "articles public read" on public.articles;
create policy "articles public read" on public.articles for select using (true);

-- Only signed-in team members may write content
drop policy if exists "documents team write" on public.documents;
create policy "documents team write" on public.documents for all to authenticated using (true) with check (true);

drop policy if exists "articles team write" on public.articles;
create policy "articles team write" on public.articles for all to authenticated using (true) with check (true);

drop policy if exists "strategy_nav public read" on public.strategy_nav;
create policy "strategy_nav public read" on public.strategy_nav for select using (true);

drop policy if exists "strategy_nav team write" on public.strategy_nav;
create policy "strategy_nav team write" on public.strategy_nav for all to authenticated using (true) with check (true);

-- Onboarding: the public may submit; only the team may read
drop policy if exists "onboarding public insert" on public.client_onboarding;
create policy "onboarding public insert" on public.client_onboarding for insert to anon, authenticated with check (true);

drop policy if exists "onboarding team read" on public.client_onboarding;
create policy "onboarding team read" on public.client_onboarding for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('documents','documents', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('onboarding','onboarding', false)
  on conflict (id) do nothing;

-- documents bucket: public read, team write
drop policy if exists "documents storage read" on storage.objects;
create policy "documents storage read" on storage.objects for select using (bucket_id = 'documents');

drop policy if exists "documents storage write" on storage.objects;
create policy "documents storage write" on storage.objects for insert to authenticated with check (bucket_id = 'documents');

drop policy if exists "documents storage delete" on storage.objects;
create policy "documents storage delete" on storage.objects for delete to authenticated using (bucket_id = 'documents');

-- onboarding bucket: public may upload, only team may read (sensitive KYC)
drop policy if exists "onboarding storage insert" on storage.objects;
create policy "onboarding storage insert" on storage.objects for insert to anon, authenticated with check (bucket_id = 'onboarding');

drop policy if exists "onboarding storage read" on storage.objects;
create policy "onboarding storage read" on storage.objects for select to authenticated using (bucket_id = 'onboarding');

-- ---------------------------------------------------------------------------
-- Seed content (only if the tables are empty) — mirrors the original site copy
-- ---------------------------------------------------------------------------
insert into public.documents (title, category, seeded)
select * from (values
  ('ACE Multicap',                    'Product decks', true),
  ('ACE Ten Trillion Opportunities',  'Product decks', true),
  ('ACE Multi-Asset',                 'Product decks', true),
  ('ACE Multicap — June 2026',        'Monthly factsheets', true),
  ('ACE Ten Trillion — June 2026',    'Monthly factsheets', true),
  ('ACE Multi-Asset — June 2026',     'Monthly factsheets', true),
  ('Investor Charter',                'Compliance & disclosures', true),
  ('SEBI Disclosure Document',        'Compliance & disclosures', true),
  ('Fee illustration',                'Compliance & disclosures', true),
  ('Grievance redressal (SCORES)',    'Compliance & disclosures', true),
  ('PMS regulations',                 'Compliance & disclosures', true),
  ('Account opening form',            'Forms', true),
  ('PIS account guidance for NRIs',   'Forms', true)
) as v(title, category, seeded)
where not exists (select 1 from public.documents);

insert into public.articles (kind, category, title, summary, read_time, published_by, seeded)
select * from (values
  ('Article', 'Strategy commentary', 'What drove our portfolios this month',
   'Strategy-wise commentary tied to the monthly factsheets — attribution, changes and outlook.',
   '6 min', 'ACE PMS Desk', true),
  ('Article', 'In the media', 'ACE PMS in the press',
   'Interviews, quotes and coverage of our strategies and market views.',
   '3 min', 'ACE PMS Desk', true)
) as v(kind, category, title, summary, read_time, published_by, seeded)
where not exists (select 1 from public.articles);
