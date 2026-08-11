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
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Trade Journal</h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">{traderName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          Çıkış yap
        </button>
      </div>

      <div className="mb-6">
        <StatsBar trades={filteredTrades} />
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <TradeForm traderName={traderName} onAdded={loadTrades} />

        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              filter === "all"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            Hepsi
          </button>
          {uniqueTraders.map((name) => (
            <button
              key={name}
              onClick={() => setFilter(name)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                filter === name
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <TradeTable trades={filteredTrades} traderName={traderName} onChanged={loadTrades} />
    </div>
  );
}
