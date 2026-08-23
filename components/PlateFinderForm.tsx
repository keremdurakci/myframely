"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import StateDropdown from "./StateDropdown";
import type { StateRules } from "@/lib/plates/types";

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-surface px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-blue-500";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500";

// Spaces (when a state allows them) are formatting, not counted against the
// character limit — mirrors validatePlate's own lengthBasis logic so the
// counter never disagrees with the real server-side check.
function meaningfulLength(value: string, rules: StateRules): number {
  return rules.supportsSpaces ? value.replace(/\s/g, "").length : value.length;
}

function rulesSummary(rules: StateRules): string {
  const parts = [`${rules.minCharacters}–${rules.maxCharacters} characters`];
  const extras: string[] = [];
  if (rules.supportsSpaces) extras.push("spaces");
  if (rules.supportsHyphens) extras.push("hyphens");
  parts.push(extras.length > 0 ? `letters, numbers & ${extras.join("/")} allowed` : "letters & numbers only");
  return parts.join(" • ");
}

export default function PlateFinderForm({
  states,
}: {
  states: { stateCode: string; stateName: string; liveCheckEnabled: boolean; rules: StateRules }[];
}) {
  const router = useRouter();
  const [state, setState] = useState("");
  const [plate, setPlate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedRules = states.find((s) => s.stateCode === state)?.rules;

  function submitCheck(e: FormEvent) {
    e.preventDefault();
    if (!state) {
      setError("Please choose a state.");
      return;
    }
    if (!plate.trim()) {
      setError("Please enter the plate you want to check.");
      return;
    }
    setError(null);
    router.push(`/results?${new URLSearchParams({ state, plate: plate.trim() }).toString()}`);
  }

  function submitPopular() {
    if (!state) {
      setError("Please choose a state first.");
      return;
    }
    setError(null);
    router.push(`/popular?${new URLSearchParams({ state }).toString()}`);
  }

  return (
    <form
      onSubmit={submitCheck}
      className="mx-auto mt-3 w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-4 text-left shadow-[0_25px_60px_rgba(0,0,0,0.08)] sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>State</span>
          <StateDropdown states={states} value={state} onChange={setState} />
          {states.some((s) => s.liveCheckEnabled) && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-red-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              LIVE = real-time availability checking is on for that state
            </span>
          )}
        </label>

        <label className="block">
          <span className={labelClass}>
            Plate
            {selectedRules && (
              <span className="float-right normal-case text-neutral-400">
                {meaningfulLength(plate, selectedRules)}/{selectedRules.maxCharacters}
              </span>
            )}
          </span>
          <input
            id="plate-word-input"
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="e.g. 45AK54, KEREM82, MUSTANG"
            maxLength={12}
            className={`${inputClass} uppercase`}
          />
          {selectedRules && <p className="mt-1.5 text-[11px] text-neutral-400">{rulesSummary(selectedRules)}</p>}
        </label>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="flex-1 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Find My Plate
        </button>
        <button
          type="button"
          onClick={submitPopular}
          disabled={!state}
          title={!state ? "Choose a state first" : undefined}
          className="flex-1 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Popular Plates
        </button>
      </div>
    </form>
  );
}
