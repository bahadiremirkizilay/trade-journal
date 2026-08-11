-- Supabase SQL Editor'de bu dosyanın tamamını çalıştırın.

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  trader_name text not null, -- "Furkan", "Ortak", vb.
  symbol text not null,
  direction text not null check (direction in ('long', 'short')),
  entry_price numeric not null,
  exit_price numeric,
  quantity numeric not null,
  entry_date timestamptz not null default now(),
  exit_date timestamptz,
  notes text,
  screenshot_url text,
  status text not null default 'open' check (status in ('open', 'closed')),
  pnl numeric,
  created_at timestamptz not null default now()
);

-- RLS'e gerek yok, herkes her şeyi görebilir/ekleyebilir
alter table public.trades disable row level security;

create index if not exists trades_trader_name_idx on public.trades(trader_name);
create index if not exists trades_entry_date_idx on public.trades(entry_date desc);
