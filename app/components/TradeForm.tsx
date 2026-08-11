"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TradeForm({
  traderName,
  onAdded,
}: {
  traderName: string;
  onAdded: () => void;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [entryDate, setEntryDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState("");

  function reset() {
    setSymbol("");
    setDirection("long");
    setEntryPrice("");
    setExitPrice("");
    setQuantity("");
    setEntryDate(new Date().toISOString().slice(0, 16));
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entry = parseFloat(entryPrice);
    const exit = exitPrice ? parseFloat(exitPrice) : null;
    const qty = parseFloat(quantity);

    if (!symbol || isNaN(entry) || isNaN(qty)) {
      setError("Sembol, giriş fiyatı ve miktar zorunludur.");
      return;
    }

    let pnl: number | null = null;
    if (exit !== null) {
      pnl = direction === "long" ? (exit - entry) * qty : (entry - exit) * qty;
    }

    setLoading(true);
    const { error: insertError } = await supabase.from("trades").insert({
      trader_name: traderName,
      symbol: symbol.toUpperCase(),
      direction,
      entry_price: entry,
      exit_price: exit,
      quantity: qty,
      entry_date: new Date(entryDate).toISOString(),
      notes: notes || null,
      status: exit !== null ? "closed" : "open",
      pnl,
    });
    setLoading(false);

    if (insertError) {
      setError("Kaydedilemedi: " + insertError.message);
      return;
    }

    reset();
    setOpen(false);
    onAdded();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-[var(--accent)] text-[#0d1117] font-medium rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
      >
        + İşlem ekle
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold">Yeni İşlem</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[var(--muted)] text-sm hover:text-[var(--text)] transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Sembol</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="BTCUSD"
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Yön</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "long" | "short")}
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Miktar</label>
          <input
            type="number"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.1"
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Giriş fiyatı</label>
          <input
            type="number"
            step="any"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            Çıkış fiyatı <span className="opacity-60">(opsiyonel)</span>
          </label>
          <input
            type="number"
            step="any"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Tarih</label>
          <input
            type="datetime-local"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="sm:col-span-2 lg:col-span-3">
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Not <span className="opacity-60">(opsiyonel)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Strateji, sebep, sonuç..."
          className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
        />
      </div>

      {error && (
        <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg px-4 py-3">
          <p className="text-sm text-[var(--red)]">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] font-medium rounded-lg py-2.5 text-sm hover:bg-[var(--border)] transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[var(--accent)] text-[#0d1117] font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
