import Image from "next/image";
import Link from "next/link";
import { Cinzel, Inter } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const products = [
  { src: "/p1.jpeg", scale: 1.18 },
  { src: "/p2.jpeg", scale: 1.50 },
  { src: "/p3.jpeg", scale: 1.12 },
  { src: "/p4.jpeg", scale: 1.16 },
  { src: "/p5.jpeg", scale: 1.14 },
  { src: "/p6.jpeg", scale: 1.3 },
  { src: "/p7.jpeg", scale: 1.2 },
  { src: "/p8.jpeg", scale: 1.13 },
  { src: "/p9.jpeg", scale: 1.12 },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030814] text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(40,110,255,0.20),transparent_16%),radial-gradient(circle_at_50%_38%,rgba(20,70,180,0.10),transparent_24%),radial-gradient(circle_at_center,rgba(255,255,255,0.025),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020611_0%,#06101d_45%,#030814_100%)]" />
        <div className="absolute left-1/2 top-[18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-[22%] h-[280px] w-[280px] -translate-x-1/2 rounded-full border border-white/10 opacity-25" />
        <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="mx-auto -mt-12 flex w-full max-w-6xl flex-col items-center text-center">
          {/* Logo panel */}
          <div className="relative mb-10">
            <div className="absolute inset-0 rounded-[34px] bg-blue-400/10 blur-2xl" />
            <div className="absolute inset-x-10 top-0 h-px bg-white/20" />
            <div className="absolute inset-x-12 bottom-0 h-px bg-white/8" />

            <div className="relative rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] px-6 py-4 shadow-[0_25px_80px_rgba(0,0,0,0.50)] backdrop-blur-lg">
              <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_35%,transparent_65%,rgba(255,255,255,0.04))]" />
              <Image
                src="/myframely-logo.png"
                alt="MyFramely logo"
                width={900}
                height={320}
                priority
                className="relative mx-auto h-auto w-[380px] sm:w-[460px] md:w-[560px] object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.42)]"
              />
            </div>
          </div>

          {/* Heading */}
          <h1
            className={`${cinzel.className} max-w-[1300px] text-[46px] leading-[0.96] tracking-[0.05em] text-white sm:text-[60px] md:text-[80px]`}
          >
            <span className="block">CUSTOM</span>

            <span className="block whitespace-nowrap">
              LICENSE PLATE
            </span>

            <span className="mt-1 block bg-[linear-gradient(180deg,#ffffff_0%,#dbeafe_100%)] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(255,255,255,0.08)]">
              FRAMES
            </span>
          </h1>

          {/* Divider */}
          <div className="mt-6 h-px w-32 bg-gradient-to-r from-transparent via-white/45 to-transparent" />

          {/* Description */}
          <p
            className={`${inter.className} mt-6 max-w-3xl text-[16px] leading-8 text-white/75 sm:text-[18px]`}
          >
            Premium handmade frames for North American plates. Bold, clean,
            custom-made pieces designed to give your vehicle a more distinctive,
            premium look.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="https://decoforge3d.etsy.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${inter.className} inline-flex min-w-[200px] items-center justify-center rounded-full border border-blue-300/30 bg-[linear-gradient(180deg,#3b82f6_0%,#2563eb_100%)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,99,235,0.35)] transition duration-300 hover:scale-[1.03] hover:shadow-[0_18px_40px_rgba(37,99,235,0.42)]`}
            >
              Shop on Etsy
            </Link>

            <a
              href="#products"
              className={`${inter.className} inline-flex min-w-[200px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 py-3.5 text-sm font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md transition duration-300 hover:scale-[1.03] hover:bg-white/[0.07]`}
            >
              View Frames
            </a>
          </div>

          {/* Trust line */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.28em] text-white/38 sm:text-xs">
            <span>HANDMADE</span>
            <span className="h-[3px] w-[3px] rounded-full bg-white/25" />
            <span>CUSTOM</span>
            <span className="h-[3px] w-[3px] rounded-full bg-white/25" />
            <span>PREMIUM FINISH</span>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section
        id="products"
        className="relative z-10 border-t border-white/10 bg-[#030814] px-6 py-20"
      >
        <div className="mx-auto max-w-6xl text-center">
          <h2
            className={`${cinzel.className} mb-10 text-3xl tracking-[0.08em] text-white md:text-4xl`}
          >
            Featured Frames
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:scale-[1.02]"
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    src={product.src}
                    alt={`Frame design ${i + 1}`}
                    fill
                    className="object-contain p-4 transition duration-300 group-hover:scale-105"
                    style={{ transform: `scale(${product.scale})` }}
                  />
                </div>

                <div className="absolute inset-x-0 top-0 h-px bg-black/10" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-black/5" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}