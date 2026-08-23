"use client";

import { useState } from "react";
import PlateResultCard from "./PlateResultCard";
import type { AvailabilityResult } from "@/lib/plates/types";

const MAX_REGENERATIONS = 3;

type Match = { plate: string; status: AvailabilityResult["status"] };

function toAvailability(status: AvailabilityResult["status"]): AvailabilityResult {
  return { status, checkedAt: new Date().toISOString(), source: "live" };
}

export default function NearbyAlternatives({
  stateCode,
  stateName,
  officialCheckerUrl,
  targetPlate,
  initialMatches,
  initialTried,
}: {
  stateCode: string;
  stateName: string;
  officialCheckerUrl: string;
  targetPlate: string;
  initialMatches: Match[];
  initialTried: string[];
}) {
  const [matches, setMatches] = useState(initialMatches);
  const [tried, setTried] = useState(initialTried);
  const [regenerations, setRegenerations] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRegenerate = regenerations < MAX_REGENERATIONS;

  async function handleGenerateMore() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plate/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateCode, plate: targetPlate, exclude: tried }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not find more options.");
        return;
      }
      setMatches((prev) => [...prev, ...data.matches]);
      setTried(data.tried);
      setRegenerations((n) => n + 1);
    } catch {
      setError("Could not find more options.");
    } finally {
      setLoading(false);
    }
  }

  if (matches.length === 0 && !canRegenerate) return null;

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold">
        {matches.length > 0 ? "Similar Plates That Are Available" : "No nearby matches found yet"}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Closest available alternatives to &quot;{targetPlate}&quot;.
      </p>

      {matches.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {matches.map((m) => (
            <PlateResultCard
              key={m.plate}
              plate={m.plate}
              stateCode={stateCode}
              stateName={stateName}
              officialCheckerUrl={officialCheckerUrl}
              availability={toAvailability(m.status)}
              liveCheckEnabled
            />
          ))}
        </div>
      )}

      {canRegenerate ? (
        <button
          type="button"
          onClick={handleGenerateMore}
          disabled={loading}
          className="mt-6 rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:bg-neutral-100 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Generate More Options"}
        </button>
      ) : (
        <p className="mt-6 text-xs text-neutral-400">
          That&apos;s as many nearby options as we can search for right now — try a different plate for more.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
