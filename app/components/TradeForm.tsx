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
  const [screenshotUrl, setScreenshotUrl] = useState("");

  function reset() {
    setSymbol("");
    setDirection("long");
    setEntryPrice("");
    setExitPrice("");
    setQuantity("");
    setEntryDate(new Date().toISOString().slice(0, 16));
    setNotes("");
    setScreenshotUrl("");
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
      screenshot_url: screenshotUrl || null,
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
      className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Yeni işlem</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[var(--muted)] text-sm hover:text-[var(--text)]"
        >
          Vazgeç
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">
          Görsel linki <span className="opacity-60">(opsiyonel)</span>
        </label>
        <input
          value={screenshotUrl}
          onChange={(e) => setScreenshotUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Not</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Kurulum, sebep, ders..."
          className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--accent)] text-[#0d1117] font-medium rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
