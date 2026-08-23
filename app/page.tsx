import Image from "next/image";
import Link from "next/link";
import { Cinzel, Inter } from "next/font/google";
import { products } from "@/lib/products";
import TiltCard from "@/components/TiltCard";
import PlateFinderForm from "@/components/PlateFinderForm";
import ScrollToPlateForm from "@/components/ScrollToPlateForm";
import { getLiveStateConfigs } from "@/lib/plates/stateConfig";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const revalidate = 3600;

export default async function HomePage() {
  const states = await getLiveStateConfigs();
  const hasAnyLiveState = states.length > 0;

  return (
    <main className="relative overflow-hidden text-neutral-900">
      <section id="search" className="relative flex flex-col items-center px-6 py-5 pb-12 sm:py-7 sm:pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(37,99,235,0.08),transparent_18%),radial-gradient(circle_at_50%_28%,rgba(37,99,235,0.04),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.5)_0%,rgba(251,251,250,0.5)_55%,rgba(245,245,243,0.5)_100%)]" />
          <div className="absolute left-1/2 top-[6%] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-[9%] h-[180px] w-[180px] -translate-x-1/2 rounded-full border border-blue-500/15 opacity-40" />
        </div>

        <Link href="/" className="relative mb-2">
          <Image
            src="/myframely-logo.png"
            alt="MyFramely"
            width={900}
            height={320}
            priority
            className="w-[105px] sm:w-[125px]"
          />
        </Link>

        <div className="relative mx-auto w-full max-w-2xl text-center">
          <p className={`${inter.className} text-xs font-semibold uppercase tracking-widest text-blue-600`}>
            Personalized Plate Finder
          </p>
          <h1 className={`${cinzel.className} mt-2 text-[22px] leading-[1.2] sm:text-[26px] md:text-[30px]`}>
            Find a Personalized Plate
            <br /> That&apos;s Actually Available
          </h1>
          <p className={`${inter.className} mx-auto mt-2 max-w-xl text-sm text-neutral-600`}>
            Type the exact plate you want and check its availability in supported U.S. states — if it&apos;s
            taken, we&apos;ll find the closest available matches.
          </p>
        </div>

        <div className="relative mx-auto mt-4 grid w-full max-w-5xl grid-cols-1 items-start gap-6 md:grid-cols-[1fr_320px] md:gap-8">
          <div>
            <PlateFinderForm
              states={states.map((s) => ({
                stateCode: s.stateCode,
                stateName: s.stateName,
                liveCheckEnabled: s.liveCheckEnabled,
                rules: s.rules,
              }))}
            />

            <p className={`${inter.className} mx-auto mt-3 max-w-md text-center text-xs text-neutral-400 md:text-left`}>
              {hasAnyLiveState
                ? "Live availability is currently supported in selected states."
                : "We're rolling out live availability checking state by state — for now, every search links straight to the official DMV site."}
            </p>
          </div>

          <div className="plate-watch-card overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#111827_0%,#1e2a4a_100%)] px-6 py-6 text-center shadow-xl">
            <p className={`${inter.className} text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300`}>
              Plate Watch
            </p>
            <h2 className={`${cinzel.className} mt-2 text-lg text-white`}>
              Already Taken? We&apos;ll Keep Watching.
            </h2>
            <p className={`${inter.className} mx-auto mt-2 text-xs text-white/70`}>
              30 days of daily checks — the moment it opens up, we email you first.
            </p>

            <div className="relative mx-auto mt-6 flex h-32 w-36 items-center justify-center">
              <div className="price-badge-back absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,#fde68a_0%,#f59e0b_100%)] shadow-2xl" />
              <div className="price-badge-front absolute flex h-[84px] w-[136px] flex-col items-center justify-center rounded-xl bg-[linear-gradient(135deg,#fb7185_0%,#dc2626_100%)] shadow-lg">
                <span className={`${inter.className} text-[10px] font-bold uppercase tracking-wider text-white/85`}>
                  Only
                </span>
                <span className={`${inter.className} text-xs font-semibold text-white/60 line-through`}>$4.99</span>
                <span className={`${cinzel.className} text-3xl text-white`}>$2.99</span>
              </div>
              <span className="absolute -left-2 -top-2 h-3 w-3 rotate-45 bg-yellow-300" />
              <span className="absolute -right-3 top-3 h-2 w-5 -rotate-12 rounded-sm bg-rose-400" />
              <span className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 rounded-[1px] bg-blue-300" />
            </div>
            <p className={`${inter.className} mt-2 text-xs text-white/50`}>/ 30 days</p>
            <p className={`${inter.className} mt-1 text-[10px] text-white/40`}>One-time charge, no auto-renewal</p>

            <ScrollToPlateForm className="mt-5 inline-block w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111827] shadow-lg transition hover:bg-blue-50">
              Find &amp; Watch a Plate
            </ScrollToPlateForm>
          </div>
        </div>
      </section>

      <section id="products" className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className={`${inter.className} text-xs font-semibold uppercase tracking-widest text-neutral-400`}>
            Custom License Plate Frames
          </p>
          <h2 className={`${cinzel.className} mb-3 mt-2 text-3xl`}>Complete the Look</h2>
          <p className={`${inter.className} mx-auto mb-10 max-w-xl text-sm text-neutral-600`}>
            Found your plate? Pair it with a premium handmade frame for North American plates.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`}>
                <TiltCard className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="relative aspect-square">
                    <Image
                      src={product.src}
                      alt={`${product.title} handmade epoxy custom license plate frame`}
                      fill
                      className="object-contain p-4"
                    />
                  </div>

                  <div className="px-4 pb-5">
                    <h3
                      className={`${inter.className} text-sm font-semibold text-neutral-900`}
                    >
                      {product.title}
                    </h3>

                    <p className="mt-2 text-xs font-medium text-blue-600">
                      View Details →
                    </p>
                  </div>
                </TiltCard>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="https://decoforge3d.etsy.com"
              target="_blank"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Shop on Etsy
            </Link>
            <span className="text-xs tracking-widest text-neutral-400">
              3D PRINTED • HAND-POURED EPOXY • CUSTOM FINISH
            </span>
          </div>

          <div className="mx-auto mt-16 max-w-4xl text-center text-xs leading-relaxed text-neutral-400">
            Custom license plate frames for cars, handmade epoxy license plate
            frames, cute car accessories, decorative license plate holders,
            personalized plate frames, veteran license plate frames, pink
            license plate frames, Snoopy license plate frames, Hello Kitty
            inspired car accessories, unique gifts for drivers, and premium
            North American plate frames.
          </div>
        </div>
      </section>
    </main>
  );
}
