import AvailabilityBadge, { type DisplayAvailability } from "./AvailabilityBadge";
import WatchPlateButton from "./WatchPlateButton";
import PlateMockup from "./PlateMockup";
import { PLATE_ART } from "@/lib/plates/plateArt";
import type { AvailabilityResult } from "@/lib/plates/types";

// source "manual" is the official-only adapter's permanent stamp — it never
// queries anything, so its UNKNOWN means "not attempted," not "attempted
// but inconclusive" (which is what UNKNOWN means from a real live adapter).
function toDisplayAvailability(result: AvailabilityResult): DisplayAvailability {
  if (result.source === "manual") return "NOT_CHECKED";
  return result.status;
}

export default function PlateResultCard({
  plate,
  stateCode,
  stateName,
  officialCheckerUrl,
  availability,
  liveCheckEnabled,
}: {
  plate: string;
  stateCode: string;
  stateName: string;
  officialCheckerUrl: string;
  availability: AvailabilityResult;
  liveCheckEnabled: boolean;
}) {
  const display = toDisplayAvailability(availability);
  const hasPlateArt = Boolean(PLATE_ART[stateCode]);
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      {hasPlateArt && (
        <div className="mb-4">
          <PlateMockup stateCode={stateCode} plate={plate} />
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-2xl font-bold tracking-wider">{plate}</span>
        <AvailabilityBadge status={display} />
      </div>
      <p className="mt-2 text-sm text-neutral-500">{stateName}</p>
      {display === "NOT_CHECKED" && (
        <p className="mt-3 text-xs text-neutral-400">Availability not checked by MyFramely yet for this state.</p>
      )}
      {display === "ERROR" && (
        <p className="mt-3 text-xs text-neutral-400">
          Live availability is temporarily unavailable — please check directly on the official DMV website.
        </p>
      )}
      {display === "TAKEN" && liveCheckEnabled && (
        <WatchPlateButton stateCode={stateCode} plate={plate} />
      )}
      <a
        href={officialCheckerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold hover:bg-neutral-100"
      >
        Check on Official DMV Website →
      </a>
    </div>
  );
}
