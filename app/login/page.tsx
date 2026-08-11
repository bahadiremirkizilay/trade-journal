"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("İsim boş olamaz");
      return;
    }
    
    localStorage.setItem("traderName", name.trim());
    localStorage.setItem("isAuthenticated", "true");
    
    // Force redirect
    setTimeout(() => {
      window.location.replace("/");
    }, 100);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0d1117] to-[#161b22]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mb-4">
            <div className="w-16 h-16 bg-[var(--accent)] rounded-2xl mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-[#0d1117]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Trade Journal</h1>
          <p className="text-[var(--muted)] text-sm">Profesyonel işlem takip sistemi</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-8 shadow-xl"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text)] mb-2">İsminiz</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              placeholder="İsminizi yazın"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-6 bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-xl px-4 py-3">
              <p className="text-sm text-[var(--red)]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[var(--accent)] text-[#0d1117] font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/20"
          >
            Giriş Yap
          </button>
        </form>

        <p className="text-center text-xs text-[var(--muted)] mt-6">
          Tüm işlemler her iki kullanıcı tarafından görülebilir
        </p>
      </div>
    </div>
  );
}
