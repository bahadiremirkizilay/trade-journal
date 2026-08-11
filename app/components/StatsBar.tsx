"use client";

import type { Trade } from "@/lib/types";

export default function StatsBar({ trades }: { trades: Trade[] }) {
  const closed = trades.filter((t) => t.pnl != null);
  const totalPnl = closed.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate = closed.length ? (wins / closed.length) * 100 : 0;
  const open = trades.length - closed.length;

  const stats = [
    { label: "Toplam işlem", value: trades.length.toString() },
    { label: "Açık pozisyon", value: open.toString() },
    { label: "Win rate", value: `${winRate.toFixed(0)}%` },
    {
      label: "Toplam P&L",
      value: totalPnl.toFixed(2),
      color: totalPnl >= 0 ? "text-[var(--green)]" : "text-[var(--red)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[var(--panel)] border border-[var(--border)] rounded-xl px-5 py-4 hover:border-[var(--accent)]/30 transition-colors"
        >
          <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">{s.label}</div>
          <div className={`text-2xl font-bold mono ${s.color ?? ""}`}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
