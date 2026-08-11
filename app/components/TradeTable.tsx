"use client";

import type { Trade } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

function formatDate(d: string) {
  return new Date(d).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TradeTable({
  trades,
  traderName,
  onChanged,
}: {
  trades: Trade[];
  traderName: string;
  onChanged: () => void;
}) {
  const supabase = createClient();

  async function handleDelete(id: string) {
    if (!confirm("Bu işlemi silmek istediğine emin misin?")) return;
    await supabase.from("trades").delete().eq("id", id);
    onChanged();
  }

  if (trades.length === 0) {
    return (
      <div className="bg-[var(--panel)] border border-dashed border-[var(--border)] rounded-xl py-20 text-center">
        <div className="text-[var(--muted)] mb-2">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-[var(--text)] font-medium mb-1">Henüz işlem yok</p>
        <p className="text-sm text-[var(--muted)]">İlk işleminizi eklemek için yukarıdaki butonu kullanın</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--border)]/30">
            <tr className="border-b border-[var(--border)]">
              <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Trader</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Sembol</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Yön</th>
              <th className="px-5 py-4 text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Giriş</th>
              <th className="px-5 py-4 text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Çıkış</th>
              <th className="px-5 py-4 text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Miktar</th>
              <th className="px-5 py-4 text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider">P&L</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Tarih</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Not</th>
              <th className="px-5 py-4 text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {trades.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-[var(--border)]/20 transition-colors"
              >
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)]">
                    {t.trader_name}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-bold mono text-[var(--text)]">{t.symbol}</span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      t.direction === "long"
                        ? "bg-[var(--green)]/15 text-[var(--green)]"
                        : "bg-[var(--red)]/15 text-[var(--red)]"
                    }`}
                  >
                    {t.direction === "long" ? "LONG" : "SHORT"}
                  </span>
                </td>
                <td className="px-5 py-4 mono text-right font-medium text-[var(--text)]">{t.entry_price}</td>
                <td className="px-5 py-4 mono text-right font-medium text-[var(--text)]">{t.exit_price ?? "—"}</td>
                <td className="px-5 py-4 mono text-right text-[var(--text)]">{t.quantity}</td>
                <td
                  className={`px-5 py-4 mono text-right font-bold ${
                    t.pnl == null
                      ? "text-[var(--muted)]"
                      : t.pnl >= 0
                      ? "text-[var(--green)]"
                      : "text-[var(--red)]"
                  }`}
                >
                  {t.pnl == null ? "Açık" : (t.pnl >= 0 ? "+" : "") + t.pnl.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-xs text-[var(--muted)] whitespace-nowrap">
                  {formatDate(t.entry_date)}
                </td>
                <td className="px-5 py-4 text-xs text-[var(--muted)] max-w-[250px] truncate" title={t.notes || ""}>
                  {t.notes || "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  {t.trader_name === traderName && (
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--red)] hover:bg-[var(--red)]/10 rounded-lg transition-colors"
                    >
                      Sil
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
