import type { Trade } from "@/lib/types";

const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function tradeReturn(t: Trade): number {
  if (t.result === "win") return t.risk_percent * t.risk_reward;
  if (t.result === "loss") return -t.risk_percent;
  return 0;
}

export type GroupStat = {
  key: string;
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  netProfit: number;
};

function groupBy(trades: Trade[], keyFn: (t: Trade) => string): GroupStat[] {
  const groups = new Map<string, Trade[]>();
  for (const t of trades) {
    const key = keyFn(t);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  return Array.from(groups.entries())
    .map(([key, groupTrades]) => {
      const total = groupTrades.length;
      const wins = groupTrades.filter((t) => t.result === "win").length;
      const losses = groupTrades.filter((t) => t.result === "loss").length;
      const netProfit = groupTrades.reduce((sum, t) => sum + tradeReturn(t), 0);
      return {
        key,
        total,
        wins,
        losses,
        winRate: total > 0 ? (wins / total) * 100 : 0,
        netProfit,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function bySymbol(trades: Trade[]): GroupStat[] {
  return groupBy(trades, (t) => t.symbol);
}

export function byDirection(trades: Trade[]): GroupStat[] {
  return groupBy(trades, (t) => (t.direction === "long" ? "Long" : "Short"));
}

export function byWeekday(trades: Trade[]): GroupStat[] {
  const stats = groupBy(trades, (t) => DAY_NAMES[new Date(t.trade_date).getDay()]);
  return stats.sort((a, b) => DAY_NAMES.indexOf(a.key) - DAY_NAMES.indexOf(b.key));
}

export function byMonth(trades: Trade[]): GroupStat[] {
  const stats = groupBy(trades, (t) => MONTH_NAMES[new Date(t.trade_date).getMonth()]);
  return stats.sort((a, b) => MONTH_NAMES.indexOf(a.key) - MONTH_NAMES.indexOf(b.key));
}

export type StreakInfo = {
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
  currentStreakType: "win" | "loss" | "none";
};

export function computeStreaks(trades: Trade[]): StreakInfo {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWin = 0;
  let currentLoss = 0;

  for (const t of sorted) {
    if (t.result === "win") {
      currentWin += 1;
      currentLoss = 0;
    } else if (t.result === "loss") {
      currentLoss += 1;
      currentWin = 0;
    } else {
      currentWin = 0;
      currentLoss = 0;
    }
    longestWinStreak = Math.max(longestWinStreak, currentWin);
    longestLossStreak = Math.max(longestLossStreak, currentLoss);
  }

  let currentStreakType: "win" | "loss" | "none" = "none";
  let currentStreak = 0;
  if (currentWin > 0) {
    currentStreakType = "win";
    currentStreak = currentWin;
  } else if (currentLoss > 0) {
    currentStreakType = "loss";
    currentStreak = currentLoss;
  }

  return { longestWinStreak, longestLossStreak, currentStreak, currentStreakType };
}

export type RiskMetrics = {
  profitFactor: number | null;
  avgRiskReward: number;
  avgRiskPercent: number;
  expectancy: number;
};

export function computeRiskMetrics(trades: Trade[]): RiskMetrics {
  const total = trades.length;
  const grossWin = trades
    .filter((t) => t.result === "win")
    .reduce((sum, t) => sum + t.risk_percent * t.risk_reward, 0);
  const grossLoss = trades
    .filter((t) => t.result === "loss")
    .reduce((sum, t) => sum + t.risk_percent, 0);

  const avgRiskReward = total > 0 ? trades.reduce((s, t) => s + t.risk_reward, 0) / total : 0;
  const avgRiskPercent = total > 0 ? trades.reduce((s, t) => s + t.risk_percent, 0) / total : 0;
  const expectancy = total > 0 ? trades.reduce((s, t) => s + tradeReturn(t), 0) / total : 0;

  return {
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
    avgRiskReward,
    avgRiskPercent,
    expectancy,
  };
}

export type EquityPoint = { date: string; cumulative: number };

export function computeEquityCurve(trades: Trade[]): EquityPoint[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  let cumulative = 0;
  return sorted.map((t) => {
    cumulative += tradeReturn(t);
    return { date: t.trade_date, cumulative: Number(cumulative.toFixed(2)) };
  });
}
