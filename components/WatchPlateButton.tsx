"use client";

import { useState } from "react";

export default function WatchPlateButton({ stateCode, plate }: { stateCode: string; plate: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/watch/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateCode,
          plate,
          returnTo: window.location.pathname + window.location.search,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-block rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Starting checkout…" : "Watch This Plate — $4.99/30 days"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
