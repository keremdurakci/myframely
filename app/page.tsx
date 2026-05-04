import Image from "next/image";
import Link from "next/link";
import { Cinzel, Inter } from "next/font/google";
import { products } from "@/lib/products";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030814] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(40,110,255,0.20),transparent_16%),radial-gradient(circle_at_50%_38%,rgba(20,70,180,0.10),transparent_24%),radial-gradient(circle_at_center,rgba(255,255,255,0.025),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020611_0%,#06101d_45%,#030814_100%)]" />
        <div className="absolute left-1/2 top-[18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-[22%] h-[280px] w-[280px] -translate-x-1/2 rounded-full border border-white/10 opacity-25" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="mx-auto -mt-12 flex w-full max-w-6xl flex-col items-center text-center">
          <div className="relative mb-10">
            <div className="absolute inset-0 rounded-[34px] bg-blue-400/10 blur-2xl" />
            <div className="relative rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] px-6 py-4 shadow-[0_25px_80px_rgba(0,0,0,0.50)] backdrop-blur-lg">
              <Image
                src="/myframely-logo.png"
                alt="MyFramely custom license plate frames logo"
                width={900}
                height={320}
                priority
                className="mx-auto w-[460px] sm:w-[560px] md:w-[680px]"
              />
            </div>
          </div>

          <h1
            className={`${cinzel.className} text-[46px] sm:text-[60px] md:text-[80px]`}
          >
            <span className="block">CUSTOM</span>
            <span className="block">LICENSE PLATE</span>
            <span className="block bg-[linear-gradient(180deg,#ffffff,#dbeafe)] bg-clip-text text-transparent">
              FRAMES
            </span>
          </h1>

          <p className={`${inter.className} mt-6 max-w-2xl text-white/75`}>
            Premium handmade frames for North American plates. Bold, clean,
            custom-made pieces designed to give your vehicle a more distinctive,
            premium look.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="https://decoforge3d.etsy.com"
              target="_blank"
              className="rounded-full bg-blue-600 px-6 py-3"
            >
              Shop on Etsy
            </Link>

            <a
              href="#products"
              className="rounded-full border border-white/20 px-6 py-3"
            >
              View Frames
            </a>
          </div>

          <div className="mt-8 text-xs tracking-widest text-white/40">
            HANDMADE • CUSTOM • PREMIUM FINISH
          </div>
        </div>
      </section>

      <section id="products" className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className={`${cinzel.className} mb-10 text-3xl`}>
            Featured Frames
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`}>
                <div className="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:scale-[1.02]">
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
                </div>
              </Link>
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-4xl text-center text-xs leading-relaxed text-white/45">
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