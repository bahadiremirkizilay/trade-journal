"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Trade } from "@/lib/types";
import TradeForm from "./components/TradeForm";
import TradeTable from "./components/TradeTable";
import StatsBar from "./components/StatsBar";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [traderName, setTraderName] = useState<string | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filter, setFilter] = useState<"all" | string>("all");
  const [loading, setLoading] = useState(true);

  const loadTrades = useCallback(async () => {
    const { data } = await supabase
      .from("trades")
      .select("*")
      .order("entry_date", { ascending: false });
    setTrades((data as Trade[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const name = localStorage.getItem("traderName");

    if (!isAuth || !name) {
      window.location.href = "/login";
      return;
    }

    setTraderName(name);
    loadTrades();
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogout() {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("traderName");
    window.location.href = "/login";
  }

  if (loading || !traderName) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted)] text-sm">
        Yükleniyor...
      </div>
    );
  }

  const uniqueTraders = Array.from(new Set(trades.map((t) => t.trader_name)));

  const filteredTrades =
    filter === "all" ? trades : trades.filter((t) => t.trader_name === filter);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Trade Journal</h1>
          <p className="text-sm text-[var(--muted)]">Giriş: <span className="text-[var(--text)] font-medium">{traderName}</span></p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel)] rounded-lg border border-[var(--border)] transition-all"
        >
          Çıkış
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <StatsBar trades={filteredTrades} />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <TradeForm traderName={traderName} onAdded={loadTrades} />

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted)] mr-2">Filtre:</span>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-[var(--accent)] text-[#0d1117]"
                : "bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/30"
            }`}
          >
            Tümü
          </button>
          {uniqueTraders.map((name) => (
            <button
              key={name}
              onClick={() => setFilter(name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === name
                  ? "bg-[var(--accent)] text-[#0d1117]"
                  : "bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/30"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Table */}
      <TradeTable trades={filteredTrades} traderName={traderName} onChanged={loadTrades} />
    </div>
  );
}
