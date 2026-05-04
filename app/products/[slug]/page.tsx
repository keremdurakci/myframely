import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#030814] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← Back to all frames
        </Link>

        <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <div className="relative aspect-square">
              <Image
                src={product.src}
                alt={`${product.title} handmade license plate frame`}
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-semibold md:text-5xl">
              {product.title}
            </h1>

            <p className="mt-6 text-white/70">{product.description}</p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={product.etsy}
                target="_blank"
                className="rounded-full bg-blue-600 px-6 py-3 text-center hover:bg-blue-500"
              >
                View on Etsy
              </Link>

              <Link
                href="/#products"
                className="rounded-full border border-white/20 px-6 py-3 text-center hover:bg-white/10"
              >
                View More Frames
              </Link>
            </div>

            <div className="mt-10 text-xs leading-relaxed text-white/50">
              Custom license plate frame, handmade epoxy frame, decorative car
              accessory, unique car gift, cute license plate frame, North
              American plate holder, premium car styling accessory.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}