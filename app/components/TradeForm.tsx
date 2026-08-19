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
  const [tradeDate, setTradeDate] = useState("");
  const [note, setNote] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  function reset() {
    setSymbol("");
    setDirection("long");
    setRiskPercent("");
    setRiskReward("");
    setResult("win");
    setTradeDate("");
    setNote("");
    setImageUrls([]);
    setImagePreviews([]);
  }

  function handleImageFiles(files: File[]) {
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Lütfen sadece resim dosyası seçin.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreviews((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      handleImageFiles(files);
      e.preventDefault();
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

    // Combine URL inputs and previews
    const allImages = [...imageUrls.filter(url => url.trim()), ...imagePreviews];
    const finalImages = allImages.length > 0 ? allImages : null;

    // Use selected date or current date
    const finalDate = tradeDate || new Date().toISOString();

    setLoading(true);
    const { error: insertError } = await supabase.from("trades").insert({
      trader_name: traderName,
      symbol: symbol.toUpperCase(),
      direction,
      risk_percent: risk,
      risk_reward: rr,
      result,
      images: finalImages,
      note: note.trim() || null,
      trade_date: finalDate,
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
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
          <p className="text-xs text-[var(--muted)] mt-1.5">Risk/Reward oranı</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text)] mb-2">Tarih</label>
          <input
            type="datetime-local"
            value={tradeDate}
            onChange={(e) => setTradeDate(e.target.value)}
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          />
          <p className="text-xs text-[var(--muted)] mt-1.5">Boş bırakılırsa şimdi</p>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-medium text-[var(--text)] mb-2">Kendime Not</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Bu işlemle ilgili kendine not bırak..."
          rows={2}
          className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 resize-none transition-all"
        />
      </div>

      {/* Image Upload Section */}
      <div className="border-t border-[var(--border)] pt-5 mb-5">
        <label className="block text-xs font-medium text-[var(--text)] mb-3">
          📸 Grafik Ekran Görüntüleri <span className="text-[var(--muted)]">(birden fazla eklenebilir)</span>
        </label>
        
        {/* File upload area */}
        <div
          onPaste={handlePaste}
          className="relative border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center hover:border-[var(--accent)]/50 transition-all cursor-pointer mb-4"
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) handleImageFiles(files);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="pointer-events-none">
            <svg className="w-12 h-12 mx-auto mb-3 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-[var(--text)] mb-1 font-medium">Dosya seçin veya yapıştırın</p>
            <p className="text-xs text-[var(--muted)]">Ctrl+V ile ekran görüntüsü · Birden fazla seçilebilir</p>
          </div>
        </div>

        {/* URL inputs */}
        <div className="mb-4">
          <label className="block text-xs text-[var(--muted)] mb-2">veya URL girin (her satıra bir URL)</label>
          <textarea
            value={imageUrls.join("\n")}
            onChange={(e) => {
              const urls = e.target.value.split("\n").filter(url => url.trim());
              setImageUrls(urls);
            }}
            placeholder="https://example.com/chart1.png&#10;https://example.com/chart2.png"
            rows={3}
            className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 resize-none"
          />
        </div>

        {/* Image Previews */}
        {(imagePreviews.length > 0 || imageUrls.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {imagePreviews.map((preview, idx) => (
              <div key={`preview-${idx}`} className="relative group">
                <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-64 object-contain bg-[#0d1117] rounded-lg border border-[var(--border)]" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="absolute top-2 right-2 bg-[var(--red)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-[var(--red)]/80 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  ✕
                </button>
              </div>
            ))}
            {imageUrls.map((url, idx) => (
              <div key={`url-${idx}`} className="relative group">
                <img 
                  src={url} 
                  alt={`URL ${idx + 1}`} 
                  className="w-full h-64 object-contain bg-[#0d1117] rounded-lg border border-[var(--border)]" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} 
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="absolute top-2 right-2 bg-[var(--red)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-[var(--red)]/80 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
