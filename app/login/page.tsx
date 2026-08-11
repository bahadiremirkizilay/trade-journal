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
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Trade Journal</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Kim olduğunuzu seçin</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5">İsminiz</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Furkan"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--red)] bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[var(--accent)] text-[#0d1117] font-medium rounded-lg py-2 text-sm hover:opacity-90 transition-opacity"
          >
            Giriş yap
          </button>
        </form>
      </div>
    </div>
  );
}
