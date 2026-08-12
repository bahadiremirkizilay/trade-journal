-- Supabase SQL Editor'de bu dosyanın tamamını çalıştırın.

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  trader_name text not null,
  symbol text not null,
  direction text not null check (direction in ('long', 'short')),
  risk_percent numeric not null,
  risk_reward numeric not null,
  result text not null check (result in ('win', 'loss', 'breakeven')),
  images text[],
  trade_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- RLS'e gerek yok, herkes her şeyi görebilir/ekleyebilir
alter table public.trades disable row level security;

create index if not exists trades_trader_name_idx on public.trades(trader_name);
create index if not exists trades_trade_date_idx on public.trades(trade_date desc);
