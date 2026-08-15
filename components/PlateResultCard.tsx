import AvailabilityBadge, { type DisplayAvailability } from "./AvailabilityBadge";
import WatchPlateButton from "./WatchPlateButton";
import PlateMockup from "./PlateMockup";
import { PLATE_ART } from "@/lib/plates/plateArt";
import type { Suggestion } from "@/lib/plates/suggestionEngine";
import type { AvailabilityResult } from "@/lib/plates/types";

// source "manual" is the official-only adapter's permanent stamp — it never
// queries anything, so its UNKNOWN means "not attempted," not "attempted
// but inconclusive" (which is what UNKNOWN means from a real live adapter).
function toDisplayAvailability(result: AvailabilityResult): DisplayAvailability {
  if (result.source === "manual") return "NOT_CHECKED";
  return result.status;
}

export default function PlateResultCard({
  suggestion,
  stateCode,
  stateName,
  officialCheckerUrl,
  availability,
  liveCheckEnabled,
}: {
  suggestion: Suggestion;
  stateCode: string;
  stateName: string;
  officialCheckerUrl: string;
  availability: AvailabilityResult;
  liveCheckEnabled: boolean;
}) {
  const display = toDisplayAvailability(availability);
  const hasPlateArt = Boolean(PLATE_ART[stateCode]);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      {hasPlateArt && (
        <div className="mb-4">
          <PlateMockup stateCode={stateCode} plate={suggestion.plate} />
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-2xl font-bold tracking-wider">{suggestion.plate}</span>
        <AvailabilityBadge status={display} />
      </div>
      <p className="mt-2 text-sm text-white/50">{stateName}</p>
      {display === "NOT_CHECKED" && (
        <p className="mt-3 text-xs text-white/40">Availability not checked by MyFramely yet for this state.</p>
      )}
      {display === "ERROR" && (
        <p className="mt-3 text-xs text-white/40">
          Live availability is temporarily unavailable — please check directly on the official DMV website.
        </p>
      )}
      {display === "TAKEN" && liveCheckEnabled && (
        <WatchPlateButton stateCode={stateCode} plate={suggestion.plate} />
      )}
      <a
        href={officialCheckerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/10"
      >
        Check on Official DMV Website →
      </a>
    </div>
  );
}
