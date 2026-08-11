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
  status: "open" | "closed";
  pnl: number | null;
  take_profit: number | null;
  stop_loss: number | null;
  image_url: string | null;
  created_at: string;
};
