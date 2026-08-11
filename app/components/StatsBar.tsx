"use client";

import type { Trade } from "@/lib/types";

export default function StatsBar({ trades }: { trades: Trade[] }) {
  const total = trades.length;
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";

  // Calculate total risk/reward percentage
  const totalRiskReward = trades.reduce((sum, t) => {
    if (t.result === "win") return sum + (t.risk_percent * t.risk_reward);
    if (t.result === "loss") return sum - t.risk_percent;
    return sum;
  }, 0);

  const stats = [
    { label: "Toplam işlem", value: total.toString() },
    { label: "Kazanan", value: wins.toString(), color: "text-[var(--green)]" },
    { label: "Kaybeden", value: losses.toString(), color: "text-[var(--red)]" },
    { label: "Win rate", value: `${winRate}%`, color: "text-[var(--accent)]" },
    {
      label: "Net Profit %",
      value: `${totalRiskReward >= 0 ? '+' : ''}${totalRiskReward.toFixed(2)}%`,
      color: totalRiskReward >= 0 ? "text-[var(--green)]" : "text-[var(--red)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[var(--panel)] border border-[var(--border)] rounded-xl px-5 py-4 hover:border-[var(--accent)]/30 transition-colors"
        >
          <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">{s.label}</div>
          <div className={`text-2xl font-bold ${s.color ?? "text-[var(--text)]"}`}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
