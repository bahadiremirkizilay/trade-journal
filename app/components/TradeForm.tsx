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
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [entryDate, setEntryDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function reset() {
    setSymbol("");
    setDirection("long");
    setEntryPrice("");
    setExitPrice("");
    setQuantity("");
    setTakeProfit("");
    setStopLoss("");
    setEntryDate(new Date().toISOString().slice(0, 16));
    setNotes("");
    setImageUrl("");
    setImageFile(null);
    setImagePreview(null);
  }

  function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Lütfen sadece resim dosyası seçin.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setImageUrl(""); // Clear URL if file is selected
    };
    reader.readAsDataURL(file);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageFile(file);
          e.preventDefault();
        }
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entry = parseFloat(entryPrice);
    const exit = exitPrice ? parseFloat(exitPrice) : null;
    const qty = parseFloat(quantity);
    const tp = takeProfit ? parseFloat(takeProfit) : null;
    const sl = stopLoss ? parseFloat(stopLoss) : null;

    if (!symbol || isNaN(entry) || isNaN(qty)) {
      setError("Sembol, giriş fiyatı ve miktar zorunludur.");
      return;
    }

    let pnl: number | null = null;
    if (exit !== null) {
      pnl = direction === "long" ? (exit - entry) * qty : (entry - exit) * qty;
    }

    // Use imageUrl if provided, otherwise use imagePreview (from paste/file)
    const finalImageUrl = imageUrl.trim() || imagePreview || null;

    setLoading(true);
    const { error: insertError } = await supabase.from("trades").insert({
      trader_name: traderName,
      symbol: symbol.toUpperCase(),
      direction,
      entry_price: entry,
      exit_price: exit,
      quantity: qty,
      take_profit: tp,
      stop_loss: sl,
      entry_date: new Date(entryDate).toISOString(),
      notes: notes || null,
      image_url: finalImageUrl,
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
          <label className="block text-xs text-[var(--muted)] mb-1">
            Take Profit <span className="opacity-60">(opsiyonel)</span>
          </label>
          <input
            type="number"
            step="any"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="TP"
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            Stop Loss <span className="opacity-60">(opsiyonel)</span>
          </label>
          <input
            type="number"
            step="any"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="SL"
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

      {/* Image Upload Section */}
      <div className="border-t border-[var(--border)] pt-5">
        <label className="block text-xs font-medium text-[var(--muted)] mb-3">
          Grafik / Ekran Görüntüsü <span className="opacity-60">(opsiyonel)</span>
        </label>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* File upload or paste area */}
          <div>
            <div
              onPaste={handlePaste}
              className="relative border-2 border-dashed border-[var(--border)] rounded-lg p-4 text-center hover:border-[var(--accent)]/50 transition-all"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="pointer-events-none">
                <svg className="w-10 h-10 mx-auto mb-2 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-[var(--muted)] mb-1">Dosya seçin veya yapıştırın</p>
                <p className="text-xs text-[var(--muted)] opacity-60">Ctrl+V ile ekran görüntüsü</p>
              </div>
            </div>
            {imagePreview && (
              <div className="mt-3 relative">
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-[var(--border)]" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-[var(--red)] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-[var(--red)]/80"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* URL input */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-2">veya URL girin</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (e.target.value.trim()) {
                  setImagePreview(null);
                  setImageFile(null);
                }
              }}
              placeholder="https://..."
              className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            />
            {imageUrl && (
              <div className="mt-3">
                <img src={imageUrl} alt="URL Preview" className="w-full h-32 object-cover rounded-lg border border-[var(--border)]" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
              </div>
            )}
          </div>
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
