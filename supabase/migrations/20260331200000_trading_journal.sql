-- Create trading_journal table
create table if not exists public.trading_journal (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  date date not null,
  title text not null,
  content text,
  mood text check (mood in ('excellent', 'good', 'neutral', 'bad', 'terrible')),
  tags text[] default '{}',
  images text[] default '{}',
  videos text[] default '{}',
  trade_ids uuid[] default '{}',
  is_private boolean default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create indexes
create index if not exists trading_journal_user_id_idx on public.trading_journal(user_id);
create index if not exists trading_journal_account_id_idx on public.trading_journal(account_id);
create index if not exists trading_journal_date_idx on public.trading_journal(date desc);
create index if not exists trading_journal_tags_idx on public.trading_journal using gin(tags);

-- RLS policies
drop policy if exists "trading_journal_own" on public.trading_journal;
create policy "trading_journal_own"
  on public.trading_journal for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger to auto-update updated_at
create trigger handle_trading_journal_updated_at
  before update on public.trading_journal
  for each row
  execute procedure public.handle_updated_at();

-- Create journal_tags table for predefined tags
create table if not exists public.journal_tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default '#3b82f6',
  created_at timestamp with time zone default now() not null,
  unique(user_id, name)
);

-- RLS for journal_tags
drop policy if exists "journal_tags_own" on public.journal_tags;
create policy "journal_tags_own"
  on public.journal_tags for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Insert default tags
insert into public.journal_tags (user_id, name, color)
select 
  id,
  tag_name,
  tag_color
from 
  (select id from auth.users) as users,
  (values 
    ('Psychologie', '#ef4444'),
    ('Stratégie', '#3b82f6'),
    ('Analyse', '#10b981'),
    ('Mistake', '#f59e0b'),
    ('Success', '#22c55e'),
    ('Risk Management', '#8b5cf6'),
    ('Market Analysis', '#06b6d4'),
    ('Emotional Control', '#ec4899')
  ) as default_tags(tag_name, tag_color)
on conflict (user_id, name) do nothing;
