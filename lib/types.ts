export type Trade = {
  id: string;
  trader_name: string;
  symbol: string;
  direction: "long" | "short";
  risk_percent: number;
  risk_reward: number;
  result: "win" | "loss" | "breakeven";
  image_url: string | null;
  trade_date: string;
  created_at: string;
};
