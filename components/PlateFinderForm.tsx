"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import StateDropdown from "./StateDropdown";

const STYLES = [
  { value: "", label: "No preference" },
  { value: "clean", label: "Clean" },
  { value: "funny", label: "Funny" },
  { value: "minimal", label: "Minimal" },
  { value: "luxury", label: "Luxury" },
  { value: "car", label: "Car" },
  { value: "business", label: "Business" },
  { value: "creative", label: "Creative" },
];

const inputClass =
  "w-full rounded-xl border border-white/15 bg-[#0a1526] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-400";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/50";

export default function PlateFinderForm({
  states,
}: {
  states: { stateCode: string; stateName: string; liveCheckEnabled: boolean }[];
}) {
  const router = useRouter();
  const [state, setState] = useState("");
  const [word, setWord] = useState("");
  const [style, setStyle] = useState("");
  const [number, setNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!state) {
      setError("Please choose a state.");
      return;
    }
    if (!word.trim()) {
      setError("Please enter a name, word, or idea.");
      return;
    }
    setError(null);

    const params = new URLSearchParams({ state, word: word.trim() });
    if (style) params.set("style", style);
    if (number.trim()) params.set("number", number.trim());
    router.push(`/results?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>State</span>
          <StateDropdown states={states} value={state} onChange={setState} />
          {states.some((s) => s.liveCheckEnabled) && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-red-400 [text-shadow:0_0_4px_rgba(248,113,113,0.9),0_0_10px_rgba(239,68,68,0.6)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_4px_1px_rgba(239,68,68,0.9),0_0_8px_2px_rgba(239,68,68,0.5)]" />
              LIVE = real-time availability checking is on for that state
            </span>
          )}
        </label>

        <label className="block">
          <span className={labelClass}>Style (optional)</span>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className={inputClass}>
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Name, Word, or Idea</span>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="e.g. KEREM, MUSTANG, NURSE"
            maxLength={30}
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Number (optional)</span>
          <input
            type="text"
            inputMode="numeric"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Birth year, lucky number, car model..."
            maxLength={8}
            className={inputClass}
          />
        </label>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-500"
      >
        Find My Plate
      </button>
    </form>
  );
}
