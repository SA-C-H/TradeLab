-- Multi-account trading system
-- Add accounts table and modify trades to support multiple accounts per user

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  account_type text not null,
  initial_capital double precision not null,
  currency text not null default 'USD',
  broker text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_account_type_check check (account_type in ('real', 'demo', 'prop_firm', 'paper')),
  constraint accounts_currency_check check (currency in ('USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'))
);

create index if not exists accounts_user_active_idx on public.accounts (user_id, is_active);

-- Add account_id to trades table
alter table public.trades 
add column if not exists account_id uuid not null references public.accounts (id) on delete cascade;

-- Create index for trades by account
create index if not exists trades_account_date_idx on public.trades (account_id, trade_date desc);

-- Update user_settings to include default account
alter table public.user_settings 
add column if not exists default_account_id uuid references public.accounts (id) on delete set null;

-- Enable RLS for accounts table
alter table public.accounts enable row level security;

-- Create policy for accounts
drop policy if exists "accounts_own" on public.accounts;
create policy "accounts_own"
  on public.accounts for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Update trades policy to include account ownership
drop policy if exists "trades_own" on public.trades;
create policy "trades_own"
  on public.trades for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger handle_accounts_updated_at
  before update on public.accounts
  for each row
  execute procedure public.handle_updated_at();
