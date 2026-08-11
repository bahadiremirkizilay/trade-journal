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
      <div className="text-center py-16 text-[var(--muted)] text-sm border border-dashed border-[var(--border)] rounded-xl">
        Henüz işlem yok. İlk işlemi eklemek için yukarıdaki butonu kullan.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
            <th className="px-4 py-3 font-medium">Kişi</th>
            <th className="px-4 py-3 font-medium">Sembol</th>
            <th className="px-4 py-3 font-medium">Yön</th>
            <th className="px-4 py-3 font-medium">Giriş</th>
            <th className="px-4 py-3 font-medium">Çıkış</th>
            <th className="px-4 py-3 font-medium">Miktar</th>
            <th className="px-4 py-3 font-medium">P&L</th>
            <th className="px-4 py-3 font-medium">Tarih</th>
            <th className="px-4 py-3 font-medium">Not</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr
              key={t.id}
              className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3 text-xs text-[var(--muted)]">
                {t.trader_name}
              </td>
              <td className="px-4 py-3 font-medium mono">{t.symbol}</td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    t.direction === "long"
                      ? "bg-[var(--green)]/15 text-[var(--green)]"
                      : "bg-[var(--red)]/15 text-[var(--red)]"
                  }`}
                >
                  {t.direction === "long" ? "Long" : "Short"}
                </span>
              </td>
              <td className="px-4 py-3 mono">{t.entry_price}</td>
              <td className="px-4 py-3 mono">{t.exit_price ?? "—"}</td>
              <td className="px-4 py-3 mono">{t.quantity}</td>
              <td
                className={`px-4 py-3 mono font-medium ${
                  t.pnl == null
                    ? "text-[var(--muted)]"
                    : t.pnl >= 0
                    ? "text-[var(--green)]"
                    : "text-[var(--red)]"
                }`}
              >
                {t.pnl == null ? "açık" : t.pnl.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                {formatDate(t.entry_date)}
              </td>
              <td className="px-4 py-3 text-xs text-[var(--muted)] max-w-[200px] truncate">
                {t.notes || "—"}
              </td>
              <td className="px-4 py-3">
                {t.trader_name === traderName && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-xs text-[var(--muted)] hover:text-[var(--red)] transition-colors"
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
  );
}
