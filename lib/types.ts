export type Trade = {
  id: string;
  trader_name: string;
  symbol: string;
  direction: "long" | "short";
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  entry_date: string;
  exit_date: string | null;
  notes: string | null;
  screenshot_url: string | null;
  status: "open" | "closed";
  pnl: number | null;
  created_at: string;
};
