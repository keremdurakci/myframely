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
  {
    src: "/p1.jpeg",
    scale: 1.18,
    link: "https://www.etsy.com/ca/listing/4484862929/handmade-hello-kitty-license-plate-frame",
  },
  {
    src: "/p2.jpeg",
    scale: 1.5,
    link: "https://www.etsy.com/ca/listing/4477236683/handmade-wing-license-plate-frame-epoxy",
  },
  {
    src: "/p3.jpeg",
    scale: 1.12,
    link: "https://www.etsy.com/ca/listing/4477232148/handmade-owl-license-plate-frame-epoxy",
  },
  {
    src: "/p4.jpeg",
    scale: 1.16,
    link: "https://www.etsy.com/ca/listing/4479874784/flame-license-plate-frame-speed-demon",
  },
  {
    src: "/p5.jpeg",
    scale: 1.14,
    link: "https://www.etsy.com/ca/listing/4479256209/handmade-fifa-world-cup-license-plate",
  },
  {
    src: "/p6.jpeg",
    scale: 1.1,
    link: "https://www.etsy.com/ca/listing/4479240661/handmade-candy-license-plate-frame-epoxy",
  },
  {
    src: "/p7.jpeg",
    scale: 1.2,
    link: "https://www.etsy.com/ca/listing/4478670801/handmade-colorful-lego-style-license",
  },
  {
    src: "/p8.jpeg",
    scale: 1.13,
    link: "https://www.etsy.com/ca/listing/4482775850/personalized-license-plate-frame-custom",
  },
  {
    src: "/p9.jpeg",
    scale: 1.12,
    link: "https://www.etsy.com/ca/listing/4486098912/handmade-no-fear-license-plate-frame",
  },
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
          {/* Logo */}
          <div className="relative mb-10">
            <div className="absolute inset-0 rounded-[34px] bg-blue-400/10 blur-2xl" />
            <div className="relative rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] px-6 py-4 shadow-[0_25px_80px_rgba(0,0,0,0.50)] backdrop-blur-lg">
              <Image
                src="/myframely-logo.png"
                alt="MyFramely logo"
                width={900}
                height={320}
                priority
                className="mx-auto w-[460px] sm:w-[560px] md:w-[680px]"
              />
            </div>
          </div>

          {/* Heading */}
          <h1
            className={`${cinzel.className} max-w-[1300px] text-[46px] leading-[0.96] tracking-[0.05em] text-white sm:text-[60px] md:text-[80px]`}
          >
            <span className="block">CUSTOM</span>
            <span className="block whitespace-nowrap">LICENSE PLATE</span>
            <span className="mt-1 block bg-[linear-gradient(180deg,#ffffff_0%,#dbeafe_100%)] bg-clip-text text-transparent">
              FRAMES
            </span>
          </h1>

          <p className={`${inter.className} mt-6 max-w-3xl text-white/75`}>
            Premium handmade frames for North American plates. Bold, clean,
  custom-made pieces designed to give your vehicle a more distinctive,
  premium look.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="https://decoforge3d.etsy.com"
              target="_blank"
              className="bg-blue-600 px-6 py-3 rounded-full"
            >
              Shop on Etsy
            </Link>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className={`${cinzel.className} mb-10 text-3xl`}>
            Featured Frames
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product, i) => (
              <Link
                key={i}
                href={product.link}
                target="_blank"
                className="group block"
              >
                <div className="overflow-hidden rounded-2xl bg-white shadow-lg hover:scale-[1.02] transition">
                  <div className="relative aspect-square">
                    <Image
                      src={product.src}
                      alt={`Frame ${i}`}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition"
                      style={{ transform: `scale(${product.scale})` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}