"use client";

import { useState } from "react";
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
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    <>
      <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--border)]/30">
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Trader</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Parite</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Yön</th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Risk %</th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-[var(--text)] uppercase tracking-wider">RR</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Sonuç</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Grafik</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Tarih</th>
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
                    <span className="font-bold mono text-[var(--text)] text-base">{t.symbol}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        t.direction === "long"
                          ? "bg-[var(--green)]/15 text-[var(--green)]"
                          : "bg-[var(--red)]/15 text-[var(--red)]"
                      }`}
                    >
                      {t.direction === "long" ? "🟢 LONG" : "🔴 SHORT"}
                    </span>
                  </td>
                  <td className="px-5 py-4 mono text-right font-medium text-[var(--text)]">{t.risk_percent}%</td>
                  <td className="px-5 py-4 mono text-right font-medium text-[var(--accent)]">{t.risk_reward}R</td>
                  <td className="px-5 py-4 text-center">
                    {t.result === "win" && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--green)]/15 text-[var(--green)]">
                        ✅ WIN
                      </span>
                    )}
                    {t.result === "loss" && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--red)]/15 text-[var(--red)]">
                        ❌ LOSS
                      </span>
                    )}
                    {t.result === "breakeven" && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--muted)]/15 text-[var(--muted)]">
                        ➖ BE
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {t.images && t.images.length > 0 ? (
                      <button
                        onClick={() => {
                          setSelectedImages(t.images!);
                          setCurrentImageIndex(0);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 transition-colors"
                        title="Grafikleri görüntüle"
                      >
                        <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium text-[var(--accent)]">{t.images.length}</span>
                      </button>
                    ) : (
                      <span className="text-[var(--muted)] text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--muted)] whitespace-nowrap">
                    {formatDate(t.trade_date)}
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

      {/* Image Modal */}
      {selectedImages && selectedImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => {
            setSelectedImages(null);
            setCurrentImageIndex(0);
          }}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => {
                setSelectedImages(null);
                setCurrentImageIndex(0);
              }}
              className="absolute -top-12 right-0 text-white hover:text-[var(--accent)] transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation arrows */}
            {selectedImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? selectedImages.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === selectedImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={selectedImages[currentImageIndex]}
              alt={`Chart ${currentImageIndex + 1}`}
              className="w-full h-full object-contain rounded-lg"
            />

            {/* Counter */}
            {selectedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {selectedImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
