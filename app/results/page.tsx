import Link from "next/link";
import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import { getStateConfig } from "@/lib/plates/stateConfig";
import { generateSuggestions, type SuggestionStyle } from "@/lib/plates/suggestionEngine";
import { getAvailabilityBatch } from "@/lib/plates/availability";
import PlateResultCard from "@/components/PlateResultCard";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const VALID_STYLES: SuggestionStyle[] = ["funny", "minimal", "business", "car"];

// Every combination of state/word/style/number is effectively unique,
// user-generated input — indexing these would just be thin-content noise,
// not useful search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type SearchParams = Promise<{ state?: string; word?: string; style?: string; number?: string }>;

export default async function ResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const stateCode = (params.state ?? "").toUpperCase();
  const word = (params.word ?? "").trim();
  const style = VALID_STYLES.includes(params.style as SuggestionStyle)
    ? (params.style as SuggestionStyle)
    : undefined;
  const number = params.number || undefined;

  const config = stateCode && word ? await getStateConfig(stateCode) : null;
  const suggestions = config ? generateSuggestions({ word, style, number, rules: config.rules }) : [];
  const availabilityByPlate = config
    ? await getAvailabilityBatch(config, suggestions.map((s) => s.plate))
    : new Map();
  const results = suggestions.map((s) => ({
    suggestion: s,
    availability: availabilityByPlate.get(s.plate)!,
  }));

  return (
    <main className="min-h-screen bg-[#030814] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← Back
        </Link>

        {!word || !stateCode ? (
          <p className={`${inter.className} mt-10 text-white/70`}>
            Enter a state and a word to find plate ideas.
          </p>
        ) : !config ? (
          <div className="mt-10">
            <h1 className={`${cinzel.className} text-3xl`}>Not Supported Yet</h1>
            <p className={`${inter.className} mt-4 max-w-xl text-white/60`}>
              We don&apos;t have &quot;{stateCode}&quot; set up yet. Try again from the homepage with one
              of the supported states.
            </p>
          </div>
        ) : (
          <>
            <h1 className={`${cinzel.className} mt-8 text-3xl sm:text-4xl`}>
              Plate Ideas for &quot;{word.toUpperCase()}&quot;
            </h1>
            <p className={`${inter.className} mt-2 text-white/60`}>{config.stateName}</p>
            <p className={`${inter.className} mt-4 max-w-2xl text-sm text-white/50`}>
              {config.liveCheckEnabled
                ? "Live availability is currently supported for this state."
                : "Live availability isn't automated for this state yet — each idea links straight to the official DMV checker."}
            </p>

            {suggestions.length === 0 ? (
              <p className={`${inter.className} mt-10 text-white/60`}>
                No plate ideas fit this state&apos;s rules — try a shorter word or fewer numbers.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.map(({ suggestion, availability }) => (
                  <PlateResultCard
                    key={suggestion.plate}
                    suggestion={suggestion}
                    stateCode={config.stateCode}
                    stateName={config.stateName}
                    officialCheckerUrl={config.officialCheckerUrl}
                    availability={availability}
                    liveCheckEnabled={config.liveCheckEnabled}
                  />
                ))}
              </div>
            )}

            <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <p className={`${inter.className} text-sm text-white/70`}>Found your plate?</p>
              <p className={`${inter.className} mt-1 text-xs text-white/50`}>
                Complete the look with a custom MyFramely plate frame.
              </p>
              <Link
                href="/#products"
                className="mt-4 inline-block rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold"
              >
                Shop Custom Frames
              </Link>
            </div>

            <p className={`${inter.className} mt-6 text-[11px] leading-relaxed text-white/35`}>
              MyFramely does not reserve license plates. Availability can change at any time and is not
              guaranteed until the relevant DMV accepts your application.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
