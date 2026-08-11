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
  const [riskPercent, setRiskPercent] = useState("");
  const [riskReward, setRiskReward] = useState("");
  const [result, setResult] = useState<"win" | "loss" | "breakeven">("win");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function reset() {
    setSymbol("");
    setDirection("long");
    setRiskPercent("");
    setRiskReward("");
    setResult("win");
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

    const risk = parseFloat(riskPercent);
    const rr = parseFloat(riskReward);

    if (!symbol || isNaN(risk) || isNaN(rr)) {
      setError("Parite, risk % ve RR zorunludur.");
      return;
    }

    // Use imageUrl if provided, otherwise use imagePreview (from paste/file)
    const finalImageUrl = imageUrl.trim() || imagePreview || null;

    setLoading(true);
    const { error: insertError } = await supabase.from("trades").insert({
      trader_name: traderName,
      symbol: symbol.toUpperCase(),
      direction,
      risk_percent: risk,
      risk_reward: rr,
      result,
      image_url: finalImageUrl,
      trade_date: new Date().toISOString(),
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
      className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold">Yeni İşlem</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-2">Parite</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="BTCUSD"
            required
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-2">Yön</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "long" | "short")}
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          >
            <option value="long">🟢 Long</option>
            <option value="short">🔴 Short</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-2">Sonuç</label>
          <select
            value={result}
            onChange={(e) => setResult(e.target.value as "win" | "loss" | "breakeven")}
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          >
            <option value="win">✅ Win</option>
            <option value="loss">❌ Loss</option>
            <option value="breakeven">➖ Breakeven</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-2">Risk %</label>
          <input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            placeholder="1.0"
            required
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          />
          <p className="text-xs text-[var(--muted)] mt-1.5">Hesabınızın risk yüzdesi</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-2">RR (Risk/Reward)</label>
          <input
            type="number"
            step="0.1"
            value={riskReward}
            onChange={(e) => setRiskReward(e.target.value)}
            placeholder="2.0"
            required
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          />
          <p className="text-xs text-[var(--muted)] mt-1.5">Risk/Reward oranı (örn: 2.0)</p>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="border-t border-[var(--border)] pt-5 mb-5">
        <label className="block text-xs font-medium text-[var(--text)] mb-3">
          📸 Grafik Ekran Görüntüsü <span className="text-[var(--muted)]">(opsiyonel)</span>
        </label>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* File upload or paste area */}
          <div>
            <div
              onPaste={handlePaste}
              className="relative border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center hover:border-[var(--accent)]/50 transition-all cursor-pointer"
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
                <svg className="w-12 h-12 mx-auto mb-3 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-[var(--text)] mb-1 font-medium">Dosya seçin veya yapıştırın</p>
                <p className="text-xs text-[var(--muted)]">Ctrl+V ile ekran görüntüsü</p>
              </div>
            </div>
            {imagePreview && (
              <div className="mt-3 relative group">
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-[var(--border)]" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-[var(--red)] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-[var(--red)]/80 opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
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

      {error && (
        <div className="bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg px-4 py-3 mb-5">
          <p className="text-sm text-[var(--red)]">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] font-medium rounded-lg py-2.5 text-sm hover:bg-[var(--border)]/30 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[var(--accent)] text-[#0d1117] font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[var(--accent)]/20"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
