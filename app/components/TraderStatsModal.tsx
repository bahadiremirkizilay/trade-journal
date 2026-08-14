"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Trade } from "@/lib/types";
import {
  bySymbol,
  byDirection,
  byWeekday,
  byMonth,
  computeStreaks,
  computeRiskMetrics,
  computeEquityCurve,
  type GroupStat,
} from "@/lib/stats";

function SummaryTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl px-5 py-4">
      <div className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">{label}</div>
      <div className={`text-2xl font-bold ${color ?? "text-[var(--text)]"}`}>{value}</div>
    </div>
  );
}

function GroupTable({ title, groups }: { title: string; groups: GroupStat[] }) {
  if (groups.length === 0) return null;

  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--text)] mb-3">{title}</h3>
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.key} className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">
              {g.key} <span className="text-xs">({g.total})</span>
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[var(--text)]">{g.winRate.toFixed(0)}% WR</span>
              <span className={g.netProfit >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}>
                {g.netProfit >= 0 ? "+" : ""}
                {g.netProfit.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TraderStatsModal({
  traderName,
  trades,
  onClose,
}: {
  traderName: string;
  trades: Trade[];
  onClose: () => void;
}) {
  const total = trades.length;
  const wins = trades.filter((t) => t.result === "win").length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;
  const netProfit = trades.reduce(
    (sum, t) => sum + (t.result === "win" ? t.risk_percent * t.risk_reward : t.result === "loss" ? -t.risk_percent : 0),
    0
  );

  const streaks = computeStreaks(trades);
  const risk = computeRiskMetrics(trades);
  const equityCurve = computeEquityCurve(trades);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">{traderName} — İstatistikler</h2>
            <p className="text-sm text-[var(--muted)] mt-1">Sadece bu traderın işlemleri</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {total === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-12">
            Bu trader için henüz işlem bulunmuyor.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Summary tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryTile label="Toplam işlem" value={total.toString()} />
              <SummaryTile label="Win rate" value={`${winRate.toFixed(1)}%`} color="text-[var(--accent)]" />
              <SummaryTile
                label="Net Profit %"
                value={`${netProfit >= 0 ? "+" : ""}${netProfit.toFixed(2)}%`}
                color={netProfit >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}
              />
              <SummaryTile
                label="Profit Factor"
                value={risk.profitFactor === null ? "—" : risk.profitFactor.toFixed(2)}
              />
              <SummaryTile
                label="Expectancy"
                value={`${risk.expectancy >= 0 ? "+" : ""}${risk.expectancy.toFixed(2)}%`}
                color={risk.expectancy >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}
              />
              <SummaryTile label="Ort. R:R" value={risk.avgRiskReward.toFixed(2)} />
              <SummaryTile label="Ort. Risk %" value={`${risk.avgRiskPercent.toFixed(2)}%`} />
              <SummaryTile
                label="Güncel seri"
                value={
                  streaks.currentStreakType === "none"
                    ? "—"
                    : `${streaks.currentStreak} ${streaks.currentStreakType === "win" ? "Kazanç" : "Kayıp"}`
                }
                color={
                  streaks.currentStreakType === "win"
                    ? "text-[var(--green)]"
                    : streaks.currentStreakType === "loss"
                    ? "text-[var(--red)]"
                    : undefined
                }
              />
            </div>

            {/* Equity curve */}
            {equityCurve.length > 1 && (
              <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Equity Eğrisi (kümülatif %)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} minTickGap={30} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${Number(value).toFixed(2)}%`, "Kümülatif"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Streaks */}
            <div className="grid grid-cols-2 gap-4">
              <SummaryTile
                label="En uzun kazanç serisi"
                value={streaks.longestWinStreak.toString()}
                color="text-[var(--green)]"
              />
              <SummaryTile
                label="En uzun kayıp serisi"
                value={streaks.longestLossStreak.toString()}
                color="text-[var(--red)]"
              />
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GroupTable title="Sembol Bazlı" groups={bySymbol(trades)} />
              <GroupTable title="Yön Bazlı" groups={byDirection(trades)} />
              <GroupTable title="Haftanın Günü" groups={byWeekday(trades)} />
              <GroupTable title="Ay Bazlı" groups={byMonth(trades)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
