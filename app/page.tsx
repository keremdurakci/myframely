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

const faqs = [
  {
    q: "Will a frame fit my plate?",
    a: "Yes — every frame fits standard US and Canadian license plates.",
  },
  {
    q: "How do I install it?",
    a: "It mounts with your plate's existing screws. No extra tools or hardware needed.",
  },
  {
    q: "How do I care for the epoxy finish?",
    a: "Wipe it with a soft cloth and mild soap. Avoid abrasive cleaners and automatic car washes with hard brushes to keep the gloss looking new.",
  },
  {
    q: "How long does shipping take?",
    a: "Each frame is handmade after you order, then ships from Etsy — $15 to the US and other countries, $35 to Canada.",
  },
];

export default function HomePage() {
  return (
    <main className="text-neutral-900">
      <div className="flex flex-col items-center px-6 pt-10 pb-4 sm:pt-12">
        <Link href="/">
          <Image
            src="/myframely-logo.png"
            alt="MyFramely"
            width={900}
            height={320}
            priority
            className="w-[105px] sm:w-[125px]"
          />
        </Link>
      </div>

      <section className="px-6 py-8 sm:py-12">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div className="text-center md:text-left">
            <p className={`${inter.className} text-xs font-semibold uppercase tracking-widest text-blue-600`}>
              Custom License Plate Frames
            </p>
            <h1 className={`${cinzel.className} mt-2 text-[26px] leading-[1.2] sm:text-[32px] md:text-[38px]`}>
              Handmade Frames. Personal Style.
            </h1>
            <p className={`${inter.className} mx-auto mt-3 max-w-md text-sm text-neutral-600 md:mx-0`}>
              Epoxy-finished license plate frames, made to order for US &amp; Canadian plates.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 md:items-start">
              <Link
                href="#products"
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Shop Frames
              </Link>
              <p className={`${inter.className} text-xs text-neutral-400`}>
                Designed by MyFramely, made by DecoForge3D on Etsy.
              </p>
            </div>
          </div>

          <TiltCard className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-md" maxTilt={7} lift={10}>
            <div className="relative aspect-[3/4]">
              <Image
                src="/products/etsy/owl-on-car.jpg"
                alt="Owl license plate frame mounted on a customer's car"
                fill
                className="object-cover"
              />
            </div>
          </TiltCard>
        </div>
      </section>

      <section id="products" className="px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className={`${inter.className} text-xs font-medium text-neutral-500`}>
            Handmade to order · secure checkout on Etsy
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
            {products.map((product) => (
              <Link key={product.slug} href={product.etsy} target="_blank" rel="noopener noreferrer">
                <TiltCard className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.src}
                      alt={`${product.title} handmade epoxy custom license plate frame`}
                      fill
                      className="object-contain p-3"
                      style={product.imageScale ? { transform: `scale(${product.imageScale})` } : undefined}
                    />
                  </div>

                  <div className="px-3 pb-3 text-left">
                    <h3 className={`${inter.className} text-sm font-semibold text-neutral-900`}>{product.title}</h3>
                    <p className="mt-1 text-xs font-medium text-blue-600">Shop on Etsy →</p>
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
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className={`${cinzel.className} text-center text-lg`}>Handmade Detail</h2>
          <p className={`${inter.className} mx-auto mt-2 max-w-xl text-center text-sm text-neutral-500`}>
            Every design starts as a 3D model, gets printed to order, and is hand-finished with a poured epoxy
            coat — so no two frames are perfectly identical, and that&apos;s the point.
          </p>

          <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-4">
            <div>
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                <Image
                  src="/products/etsy/wing-closeup-1.jpg"
                  alt="Close-up of the hand-poured epoxy finish on a Wing license plate frame"
                  fill
                  className="object-cover"
                />
              </div>
              <p className={`${inter.className} mt-2 text-center text-xs text-neutral-500`}>
                Hand-poured epoxy, glossy finish
              </p>
            </div>
            <div>
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                <Image
                  src="/products/etsy/wing-closeup-2.jpg"
                  alt="Wing license plate frame mounted and ready to drive"
                  fill
                  className="object-cover"
                />
              </div>
              <p className={`${inter.className} mt-2 text-center text-xs text-neutral-500`}>
                Mounted and ready to drive
              </p>
            </div>
          </div>

          <h2 className={`${cinzel.className} mt-12 text-center text-lg`}>Frequently Asked Questions</h2>
          <div className="mt-6 divide-y divide-neutral-200">
            {faqs.map((item) => (
              <div key={item.q} className="py-4">
                <h3 className={`${inter.className} text-sm font-semibold text-neutral-900`}>{item.q}</h3>
                <p className={`${inter.className} mt-1 text-sm text-neutral-600`}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
