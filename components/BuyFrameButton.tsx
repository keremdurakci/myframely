"use client";

import { useState } from "react";
import type { ShippingDestination } from "@/lib/orders";
import { SHIPPING_LABEL, SHIPPING_RATES_USD_CENTS } from "@/lib/orders";

export default function BuyFrameButton({ slug }: { slug: string }) {
  const [destination, setDestination] = useState<ShippingDestination>("INTL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          destination,
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
      <label className="mb-3 block text-xs text-neutral-500">
        Ship to
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value as ShippingDestination)}
          className="ml-2 rounded-md border border-neutral-300 bg-white px-2 py-1 text-neutral-900"
        >
          {(Object.keys(SHIPPING_LABEL) as ShippingDestination[]).map((key) => (
            <option key={key} value={key} className="text-black">
              {SHIPPING_LABEL[key]} — ${SHIPPING_RATES_USD_CENTS[key] / 100} shipping
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-emerald-600 px-6 py-3 text-center text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "Starting checkout…" : "Buy Now — $40"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
