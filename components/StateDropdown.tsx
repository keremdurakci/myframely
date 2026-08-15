"use client";

import { useEffect, useRef, useState } from "react";

type StateOption = { stateCode: string; stateName: string; liveCheckEnabled: boolean };

const triggerClass =
  "flex w-full items-center justify-between rounded-xl border border-white/15 bg-[#0a1526] px-3 py-2.5 text-left text-sm text-white outline-none focus:border-blue-400";

// A real DOM list, not a native <select>/<option> — the state picker needed
// per-item styling (a small pulsing glow next to "LIVE" rows) that native
// <option> elements can't render at all: browsers draw the open dropdown
// list themselves and ignore page CSS on it entirely, no font-size,
// text-shadow, or animation gets through.
export default function StateDropdown({
  states,
  value,
  onChange,
}: {
  states: StateOption[];
  value: string;
  onChange: (stateCode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selected = states.find((s) => s.stateCode === value);

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className={triggerClass} aria-haspopup="listbox" aria-expanded={open}>
        <span className={selected ? "" : "text-white/30"}>{selected ? selected.stateName : "Select a state"}</span>
        <svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-white/15 bg-[#0a1526] py-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {states.map((s) => (
            <li key={s.stateCode} role="option" aria-selected={s.stateCode === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.stateCode);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-white/10 ${
                  s.stateCode === value ? "bg-white/5 text-white" : "text-white/85"
                }`}
              >
                <span>{s.stateName}</span>
                {s.liveCheckEnabled && (
                  <span className="inline-flex items-center gap-1 text-[8px] font-semibold tracking-wide text-red-400 [text-shadow:0_0_3px_rgba(248,113,113,0.9),0_0_8px_rgba(239,68,68,0.6)]">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-red-500 shadow-[0_0_3px_1px_rgba(239,68,68,0.9),0_0_6px_2px_rgba(239,68,68,0.5)]" />
                    LIVE
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
