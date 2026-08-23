import Image from "next/image";
import Link from "next/link";
import { Cinzel, Inter } from "next/font/google";
import { products } from "@/lib/products";
import TiltCard from "@/components/TiltCard";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const revalidate = 3600;

export default function HomePage() {
  return (
    <main className="relative overflow-hidden text-neutral-900">
      <section className="relative flex flex-col items-center px-6 py-10 pb-6 sm:py-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(37,99,235,0.08),transparent_18%),radial-gradient(circle_at_50%_28%,rgba(37,99,235,0.04),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.5)_0%,rgba(251,251,250,0.5)_55%,rgba(245,245,243,0.5)_100%)]" />
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
            Custom License Plate Frames
          </p>
          <h1 className={`${cinzel.className} mt-2 text-[22px] leading-[1.2] sm:text-[26px] md:text-[30px]`}>
            Complete the Look
          </h1>
          <p className={`${inter.className} mx-auto mt-2 max-w-xl text-sm text-neutral-600`}>
            Premium handmade epoxy license plate frames for North American plates.
          </p>
        </div>
      </section>

      <section id="products" className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <Link key={product.slug} href={product.etsy} target="_blank" rel="noopener noreferrer">
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
                      Shop on Etsy →
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
              rel="noopener noreferrer"
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
