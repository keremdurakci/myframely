import Image from "next/image";
import Link from "next/link";
import { Cinzel, Inter } from "next/font/google";
import { products } from "@/lib/products";
import TiltCard from "@/components/TiltCard";
import PlateFinderForm from "@/components/PlateFinderForm";
import { getAllStateConfigs } from "@/lib/plates/stateConfig";

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
  const states = await getAllStateConfigs();
  const hasAnyLiveState = states.some((s) => s.liveCheckEnabled);

  return (
    <main className="relative overflow-hidden bg-page text-white">
      <section className="relative flex flex-col items-center px-6 py-5 sm:py-7">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(40,110,255,0.20),transparent_16%),radial-gradient(circle_at_50%_26%,rgba(20,70,180,0.10),transparent_24%),radial-gradient(circle_at_center,rgba(255,255,255,0.025),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#141414_0%,#1c1c1c_55%,#242424_100%)]" />
          <div className="absolute left-1/2 top-[6%] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-[9%] h-[180px] w-[180px] -translate-x-1/2 rounded-full border border-white/10 opacity-25" />
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
          <p className={`${inter.className} text-xs font-semibold uppercase tracking-widest text-blue-400`}>
            Personalized Plate Finder
          </p>
          <h1 className={`${cinzel.className} mt-2 text-[22px] leading-[1.2] sm:text-[26px] md:text-[30px]`}>
            Find a Personalized Plate
            <br /> That&apos;s Actually Available
          </h1>
          <p className={`${inter.className} mx-auto mt-2 max-w-xl text-sm text-white/70`}>
            Generate personalized license plate ideas and check availability in supported U.S. states.
          </p>

          <PlateFinderForm
            states={states.map((s) => ({
              stateCode: s.stateCode,
              stateName: s.stateName,
              liveCheckEnabled: s.liveCheckEnabled,
            }))}
          />

          <p className={`${inter.className} mx-auto mt-3 max-w-md text-xs text-white/40`}>
            {hasAnyLiveState
              ? "Live availability is currently supported in selected states."
              : "We're rolling out live availability checking state by state — for now, every idea links straight to the official DMV site."}
          </p>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-4">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-6 text-center">
          <p className={`${inter.className} text-xs font-semibold uppercase tracking-widest text-red-400`}>
            Plate Watch
          </p>
          <h2 className={`${cinzel.className} mt-2 text-xl sm:text-2xl`}>Already Taken? We&apos;ll Keep Watching.</h2>
          <p className={`${inter.className} mx-auto mt-2 max-w-lg text-sm text-white/60`}>
            $4.99 gets you 30 days of daily availability checks on any taken plate — the moment it opens up,
            we email you.
          </p>
        </div>
      </section>

      <section id="products" className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className={`${inter.className} text-xs font-semibold uppercase tracking-widest text-white/40`}>
            Custom License Plate Frames
          </p>
          <h2 className={`${cinzel.className} mb-3 mt-2 text-3xl`}>Complete the Look</h2>
          <p className={`${inter.className} mx-auto mb-10 max-w-xl text-sm text-white/60`}>
            Found your plate? Pair it with a premium handmade frame for North American plates.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`}>
                <TiltCard className="overflow-hidden rounded-2xl bg-white shadow-lg">
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
                      className={`${inter.className} text-sm font-semibold text-[#030814]`}
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
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold"
            >
              Shop on Etsy
            </Link>
            <span className="text-xs tracking-widest text-white/40">
              3D PRINTED • HAND-POURED EPOXY • CUSTOM FINISH
            </span>
          </div>

          <div className="mx-auto mt-16 max-w-4xl text-center text-xs leading-relaxed text-white/45">
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
