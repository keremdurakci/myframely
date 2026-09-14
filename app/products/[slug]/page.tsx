import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { display, plateMono, body } from "@/lib/fonts";
import { products, getMetaDescription } from "@/lib/products";
import TiltCard from "@/components/TiltCard";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://www.myframely.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};

  const title = `${product.title} | MyFramely`;
  const description = getMetaDescription(product);
  const url = `/products/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "MyFramely",
      images: [{ url: product.src, alt: `${product.title} handmade license plate frame` }],
      type: "website",
    },
  };
}

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

  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: getMetaDescription(product),
    image: `${SITE_URL}${product.src}`,
    brand: { "@type": "Brand", name: "MyFramely" },
    offers: {
      "@type": "Offer",
      url: product.etsy,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: product.title, item: productUrl },
    ],
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="mx-auto max-w-5xl">
        <Link href="/" className={`${plateMono.className} text-xs uppercase tracking-wide text-ink-soft hover:text-ink`}>
          ← Back to all frames
        </Link>

        <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
          <TiltCard className="plate-holes rounded-lg border border-chrome/40 bg-white p-6 shadow-xl" maxTilt={9} lift={14}>
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.src}
                alt={`${product.title} handmade license plate frame`}
                fill
                className="object-contain"
                style={product.imageScale ? { transform: `scale(${product.imageScale})` } : undefined}
              />
            </div>
          </TiltCard>

          <div>
            <span
              className={`${plateMono.className} inline-block rounded border border-chrome/50 bg-surface px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-ink-soft`}
            >
              3D Printed · Hand-Poured Epoxy
            </span>

            <h1 className={`${display.className} mt-4 text-4xl uppercase tracking-wide text-ink md:text-5xl`}>
              {product.title}
            </h1>

            <p className={`${plateMono.className} mt-3 text-xs uppercase tracking-wide text-ink-soft`}>
              Handmade to order · see current price on Etsy
            </p>

            <p className={`${body.className} mt-6 whitespace-pre-line text-ink-soft`}>{product.description}</p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Link
                href={product.etsy}
                target="_blank"
                rel="noopener noreferrer"
                className={`${body.className} plate-button inline-flex items-center justify-center bg-ontario py-3 text-center text-sm font-bold uppercase tracking-wide text-white hover:bg-blue-600`}
              >
                Shop on Etsy
              </Link>

              <Link
                href="/#products"
                className={`${body.className} inline-flex items-center justify-center rounded border border-chrome px-6 py-3 text-center text-sm font-semibold text-ink hover:bg-surface`}
              >
                View More Frames
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
