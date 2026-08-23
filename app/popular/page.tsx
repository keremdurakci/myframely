import type { Metadata } from "next";
import Link from "next/link";
import { Cinzel, Inter } from "next/font/google";
import { getStateConfig } from "@/lib/plates/stateConfig";
import { getAvailablePopularPlates } from "@/lib/plates/popularPlates";
import PlateResultCard from "@/components/PlateResultCard";
import JsonLd from "@/components/JsonLd";
import type { AvailabilityResult } from "@/lib/plates/types";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

type SearchParams = Promise<{ state?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { state } = await searchParams;
  const config = state ? await getStateConfig(state.toUpperCase()) : null;
  if (!config) {
    return { title: "Popular Available Plates | MyFramely", robots: { index: false, follow: false } };
  }
  return {
    title: `Popular Available Plates in ${config.stateName} | MyFramely`,
    description: `Personalized license plate ideas that are currently available in ${config.stateName}, checked live against the official state system.`,
    alternates: { canonical: `/popular?state=${config.stateCode}` },
  };
}

export default async function PopularPlatesPage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await searchParams;
  const stateCode = (state ?? "").toUpperCase();
  const config = stateCode ? await getStateConfig(stateCode) : null;

  const entries = config ? await getAvailablePopularPlates(config.stateCode) : [];

  const itemListJsonLd =
    config && entries.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Popular available license plates in ${config.stateName}`,
          itemListElement: entries.map((entry, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: entry.word,
          })),
        }
      : null;

  return (
    <main className="min-h-screen px-6 py-12 text-neutral-900">
      {itemListJsonLd && <JsonLd data={itemListJsonLd} />}
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Back
        </Link>

        {!stateCode ? (
          <p className={`${inter.className} mt-10 text-neutral-600`}>
            Choose a state on the homepage to see popular plates that are currently available there.
          </p>
        ) : !config ? (
          <div className="mt-10">
            <h1 className={`${cinzel.className} text-3xl`}>Not Supported Yet</h1>
            <p className={`${inter.className} mt-4 max-w-xl text-neutral-600`}>
              We don&apos;t have &quot;{stateCode}&quot; set up yet.
            </p>
          </div>
        ) : (
          <>
            <h1 className={`${cinzel.className} mt-8 text-3xl sm:text-4xl`}>
              Popular Plates Available in {config.stateName}
            </h1>
            <p className={`${inter.className} mt-3 max-w-xl text-sm text-neutral-500`}>
              Real plate ideas, checked live against {config.stateName}&apos;s official system. Updated regularly —
              availability can change at any time.
            </p>

            {entries.length === 0 ? (
              <p className={`${inter.className} mt-10 text-neutral-600`}>
                Nothing available from our current list right now — check back soon, or{" "}
                <Link href="/" className="text-blue-600 hover:underline">
                  search your own idea
                </Link>{" "}
                instead.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {entries.map((entry) => {
                  const availability: AvailabilityResult = {
                    status: "AVAILABLE",
                    checkedAt: entry.checkedAt,
                    source: "live",
                  };
                  return (
                    <PlateResultCard
                      key={entry.word}
                      plate={entry.word}
                      stateCode={config.stateCode}
                      stateName={config.stateName}
                      officialCheckerUrl={config.officialCheckerUrl}
                      availability={availability}
                      liveCheckEnabled={config.liveCheckEnabled}
                    />
                  );
                })}
              </div>
            )}

            <p className={`${inter.className} mt-10 text-[11px] leading-relaxed text-neutral-400`}>
              MyFramely does not reserve license plates. Availability can change at any time and is not guaranteed
              until {config.stateName}&apos;s DMV accepts your application.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
