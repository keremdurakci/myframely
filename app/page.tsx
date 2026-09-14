import Image from "next/image";
import Link from "next/link";
import { display, plateMono, body } from "@/lib/fonts";
import { products } from "@/lib/products";
import TiltCard from "@/components/TiltCard";

export const revalidate = 3600;

// Real reviews from decoforge3d.etsy.com, on products that are actually
// sold on this site — Etsy's other reviews on this shop (for a separate
// Elvis Presley panel listing) and the one 1-star shipping-damage review
// are left out: not representative of a frame, or not a testimonial.
const reviews = [
  {
    quote: "Fantastic license plate cover. High recommend.",
    name: "Dorothy",
    date: "Aug 2026",
    productSlug: "rainbow-license-plate-frame",
  },
  {
    quote:
      "This tag frame is beautiful. Even prettier in person... There's no AI or Chinese poorly made items passed off as homemade. It's the real deal!",
    name: "Etsy Buyer",
    date: "Jun 2026",
    productSlug: "wing-license-plate-frame",
  },
  {
    quote: "Unique piece of automotive art that sets my car apart!",
    name: "Warren",
    date: "May 2026",
    productSlug: "owl-license-plate-frame",
  },
];

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
    <main>
      {/* Hero — the dark "frame" edge that bookends the page, like the
          chrome border around a plate. */}
      <section className="relative overflow-hidden bg-ink px-6 py-14 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_-5%,rgba(30,79,209,0.28),transparent_70%)]"
        />

        <div className="relative mx-auto max-w-6xl">
          <Link href="/" className="mx-auto mb-8 block w-fit md:mx-0">
            <Image
              src="/myframely-logo.png"
              alt="MyFramely"
              width={900}
              height={320}
              priority
              className="w-44 sm:w-52"
            />
          </Link>

          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="text-center md:text-left">
              <p className={`${plateMono.className} text-xs font-medium uppercase tracking-[0.2em] text-ontario-light`}>
                Custom License Plate Frames
              </p>
              <h1
                className={`${display.className} mt-3 text-[clamp(2.5rem,7vw,3.75rem)] uppercase leading-[0.95] tracking-wide text-white`}
              >
                Handmade Frames.
                <br />
                Personal Style.
              </h1>
              <p className={`${body.className} mx-auto mt-4 max-w-md text-sm text-plate-soft md:mx-0`}>
                Epoxy-finished license plate frames, made to order for US &amp; Canadian plates.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 md:items-start">
                <Link
                  href="#products"
                  className={`${body.className} plate-button inline-flex items-center bg-ontario py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-blue-600`}
                >
                  Shop Frames
                </Link>
                <p className={`${plateMono.className} text-[11px] text-plate-soft/80`}>
                  Designed by MyFramely — made by DecoForge3D on Etsy
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              <TiltCard maxTilt={7} lift={10}>
                <div className="relative aspect-[3/4]">
                  <video
                    src="/videos/owl-frame-hero.mp4"
                    poster="/products/etsy/owl-on-car.jpg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(0,0,0,0.35))]"
                  />
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* Products — the light "plate" interior of the page. */}
      <section id="products" className="relative px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className={`${plateMono.className} text-center text-[11px] uppercase tracking-[0.2em] text-ink-soft`}>
            Handmade to order · secure checkout on Etsy
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <Link key={product.slug} href={product.etsy} target="_blank" rel="noopener noreferrer" className="group block">
                <TiltCard className="plate-holes overflow-hidden rounded-lg border border-chrome/40 bg-white shadow-sm transition-shadow hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.src}
                      alt={`${product.title} handmade epoxy custom license plate frame`}
                      fill
                      className="object-contain p-3"
                      style={product.imageScale ? { transform: `scale(${product.imageScale})` } : undefined}
                    />
                    <span className="gloss-sweep" aria-hidden />
                  </div>

                  <div className="px-3 pb-3 pt-1 text-left">
                    <h3 className={`${body.className} text-sm font-semibold text-ink`}>{product.title}</h3>
                    <p className={`${plateMono.className} mt-1 text-[11px] font-medium uppercase tracking-wide text-ontario`}>
                      Shop on Etsy →
                    </p>
                  </div>
                </TiltCard>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="https://decoforge3d.etsy.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${body.className} plate-button inline-flex items-center bg-ink py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-neutral-800`}
            >
              Shop on Etsy
            </Link>
            <span className={`${plateMono.className} text-[11px] uppercase tracking-[0.2em] text-ink-soft`}>
              3D Printed · Hand-Poured Epoxy · Custom Finish
            </span>
          </div>
        </div>
      </section>

      {/* Handmade Detail — dark band again, closing the "frame" around the
          light product section. */}
      <section className="relative bg-ink px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={`${display.className} text-2xl uppercase tracking-wide text-white sm:text-3xl`}>
            Handmade Detail
          </h2>
          <p className={`${body.className} mx-auto mt-3 max-w-xl text-sm text-plate-soft`}>
            Every design starts as a 3D model, gets printed to order, and is hand-finished with a poured epoxy
            coat — so no two frames are perfectly identical, and that&apos;s the point.
          </p>

          <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-4">
            <div>
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10">
                <Image
                  src="/products/etsy/wing-closeup-1.jpg"
                  alt="Close-up of the hand-poured epoxy finish on a Wing license plate frame"
                  fill
                  className="object-cover"
                />
              </div>
              <p className={`${plateMono.className} mt-2 text-center text-[11px] uppercase tracking-wide text-plate-soft`}>
                Hand-poured epoxy, glossy finish
              </p>
            </div>
            <div>
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10">
                <Image
                  src="/products/etsy/wing-closeup-2.jpg"
                  alt="Wing license plate frame mounted and ready to drive"
                  fill
                  className="object-cover"
                />
              </div>
              <p className={`${plateMono.className} mt-2 text-center text-[11px] uppercase tracking-wide text-plate-soft`}>
                Mounted and ready to drive
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Etsy reviews — three, because that's how many genuine,
          on-topic, positive reviews the shop actually has. */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className={`${display.className} text-2xl uppercase tracking-wide text-ink sm:text-3xl`}>
            What Customers Say
          </h2>
          <p className={`${plateMono.className} mt-2 text-[11px] uppercase tracking-[0.2em] text-ink-soft`}>
            Real reviews from Etsy buyers
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {reviews.map((review) => {
              const product = products.find((p) => p.slug === review.productSlug);
              if (!product) return null;
              return (
                <Link
                  key={review.name}
                  href={product.etsy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plate-holes flex flex-col items-center rounded-lg border border-chrome/40 bg-white p-5 text-left shadow-sm"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-chrome/40 bg-surface">
                    <Image src={product.src} alt={product.title} fill className="object-contain p-1" />
                  </div>
                  <p className="mt-3 text-[13px] text-resin">★★★★★</p>
                  <p className={`${body.className} mt-2 text-sm italic text-ink-soft`}>&ldquo;{review.quote}&rdquo;</p>
                  <p className={`${plateMono.className} mt-3 text-[11px] uppercase tracking-wide text-ink-soft`}>
                    {review.name} · {review.date}
                  </p>
                  <p className={`${plateMono.className} mt-1 text-[10px] uppercase tracking-wide text-ontario`}>
                    {product.title}
                  </p>
                </Link>
              );
            })}
          </div>

          <a
            href="https://www.etsy.com/ca/shop/DecoForge3D/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className={`${plateMono.className} mt-8 inline-block text-[11px] uppercase tracking-wide text-ontario hover:underline`}
          >
            See all reviews on Etsy →
          </a>
        </div>
      </section>

      {/* FAQ — light again. Numbering here is real: these are the four
          most-asked questions in a fixed, meaningful order. */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className={`${display.className} text-center text-2xl uppercase tracking-wide text-ink`}>
            Frequently Asked
          </h2>

          <div className="mt-8 divide-y divide-chrome/30">
            {faqs.map((item, i) => (
              <div key={item.q} className="flex gap-4 py-5">
                <span className={`${plateMono.className} shrink-0 text-xs font-semibold text-ontario`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className={`${body.className} text-sm font-semibold text-ink`}>{item.q}</h3>
                  <p className={`${body.className} mt-1 text-sm text-ink-soft`}>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
