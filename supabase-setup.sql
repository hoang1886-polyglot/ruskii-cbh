-- ─── ГОВОРИ — SUPABASE SETUP ─────────────────────────────────
-- Run this in your Supabase project → SQL Editor

-- 1. EXAMS TABLE
create table if not exists exams (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  title          text not null,
  level          text,
  question_count integer default 0,
  sections       jsonb not null default '[]'
);

-- 2. EXAM RESULTS TABLE
create table if not exists exam_results (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  user_id     uuid references auth.users(id) on delete cascade,
  exam_id     uuid references exams(id) on delete cascade,
  score       integer,      -- percentage 0-100
  correct     integer,
  total       integer,
  time_taken  integer       -- seconds
);

-- 3. ROW LEVEL SECURITY

-- EXAMS: anyone can read, only service role can write
alter table exams enable row level security;

create policy "Public can read exams"
  on exams for select using (true);

-- Note: inserts are done via anon key on admin page.
-- For stronger security, restrict this to a server-side function.
create policy "Allow insert for authenticated"
  on exams for insert
  with check (auth.role() = 'authenticated');

create policy "Allow delete for authenticated"
  on exams for delete
  using (auth.role() = 'authenticated');

-- RESULTS: users can only see/insert their own
alter table exam_results enable row level security;

create policy "Users can insert own results"
  on exam_results for insert
  with check (auth.uid() = user_id);

create policy "Users can view own results"
  on exam_results for select
  using (auth.uid() = user_id);
