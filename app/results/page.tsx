import Link from "next/link";
import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import { getStateConfig } from "@/lib/plates/stateConfig";
import { normalizePlate } from "@/lib/plates/normalize";
import { validatePlate } from "@/lib/plates/validation";
import { getAvailabilityBatch, findNearbyAvailablePlates } from "@/lib/plates/availability";
import PlateResultCard from "@/components/PlateResultCard";
import NearbyAlternatives from "@/components/NearbyAlternatives";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const INITIAL_NEARBY_WANTED = 5;

// Every combination of state/plate is effectively unique, user-generated
// input — indexing these would just be thin-content noise, not useful
// search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type SearchParams = Promise<{ state?: string; plate?: string; mode?: string }>;

export default async function ResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const stateCode = (params.state ?? "").toUpperCase();
  const rawPlate = (params.plate ?? "").trim();
  // "alternatives" skips the exact-plate check entirely and goes straight
  // to nearby matches — for someone who wants variations on an idea, not a
  // verdict on the literal string they typed.
  const alternativesOnly = params.mode === "alternatives";

  const config = stateCode && rawPlate ? await getStateConfig(stateCode) : null;
  const normalizedPlate = config ? normalizePlate(rawPlate, config.rules) : "";
  const validation = config ? validatePlate(normalizedPlate, config.rules) : null;
  const isValid = Boolean(validation?.valid);

  const exactAvailability =
    !alternativesOnly && config && isValid
      ? (await getAvailabilityBatch(config, [normalizedPlate])).get(normalizedPlate)
      : undefined;

  const needsAlternatives =
    config?.liveCheckEnabled && isValid && (alternativesOnly || exactAvailability?.status === "TAKEN");
  const nearby =
    needsAlternatives && config
      ? await findNearbyAvailablePlates(config, normalizedPlate, new Set([normalizedPlate]), INITIAL_NEARBY_WANTED)
      : null;

  return (
    <main className="min-h-screen px-6 py-12 text-neutral-900">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Back
        </Link>

        {!rawPlate || !stateCode ? (
          <p className={`${inter.className} mt-10 text-neutral-600`}>
            Enter a state and the plate you want to search for.
          </p>
        ) : !config ? (
          <div className="mt-10">
            <h1 className={`${cinzel.className} text-3xl`}>Not Supported Yet</h1>
            <p className={`${inter.className} mt-4 max-w-xl text-neutral-600`}>
              We don&apos;t have &quot;{stateCode}&quot; set up yet. Try again from the homepage with one
              of the supported states.
            </p>
          </div>
        ) : !validation?.valid ? (
          <div className="mt-10">
            <h1 className={`${cinzel.className} text-3xl`}>Not a Valid Plate</h1>
            <p className={`${inter.className} mt-4 max-w-xl text-neutral-600`}>{validation?.reason}</p>
          </div>
        ) : (
          <>
            <h1 className={`${cinzel.className} mt-8 text-3xl sm:text-4xl`}>
              {alternativesOnly ? (
                <>Plates Similar to &quot;{normalizedPlate}&quot;</>
              ) : (
                <>Checking &quot;{normalizedPlate}&quot;</>
              )}
            </h1>
            <p className={`${inter.className} mt-2 text-neutral-600`}>{config.stateName}</p>
            <p className={`${inter.className} mt-4 max-w-2xl text-sm text-neutral-500`}>
              {config.liveCheckEnabled
                ? "Live availability is currently supported for this state."
                : "Live availability isn't automated for this state yet — check directly on the official DMV site."}
            </p>

            {!alternativesOnly && (
              <div className="mt-8 max-w-md">
                <PlateResultCard
                  plate={normalizedPlate}
                  stateCode={config.stateCode}
                  stateName={config.stateName}
                  officialCheckerUrl={config.officialCheckerUrl}
                  availability={exactAvailability!}
                  liveCheckEnabled={config.liveCheckEnabled}
                />
              </div>
            )}

            {alternativesOnly && !config.liveCheckEnabled && (
              <p className={`${inter.className} mt-8 text-neutral-600`}>
                Alternatives need live availability checking, which isn&apos;t on for this state yet.
              </p>
            )}

            {needsAlternatives && nearby && (
              <NearbyAlternatives
                stateCode={config.stateCode}
                stateName={config.stateName}
                officialCheckerUrl={config.officialCheckerUrl}
                targetPlate={normalizedPlate}
                initialMatches={nearby.matches.map((m) => ({ plate: m.plate, status: m.availability.status }))}
                initialTried={nearby.tried}
              />
            )}

            <div className="mt-14 rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
              <p className={`${inter.className} text-sm text-neutral-700`}>Found your plate?</p>
              <p className={`${inter.className} mt-1 text-xs text-neutral-500`}>
                Complete the look with a custom MyFramely plate frame.
              </p>
              <Link
                href="/#products"
                className="mt-4 inline-block rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Shop Custom Frames
              </Link>
            </div>

            <p className={`${inter.className} mt-6 text-[11px] leading-relaxed text-neutral-400`}>
              MyFramely does not reserve license plates. Availability can change at any time and is not
              guaranteed until the relevant DMV accepts your application.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
