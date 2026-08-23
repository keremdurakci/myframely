import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className="min-h-screen px-6 py-12 text-neutral-900">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Back to all frames
        </Link>

        <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
          <TiltCard
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl"
            maxTilt={9}
            lift={14}
          >
            <div className="relative aspect-square">
              <Image
                src={product.src}
                alt={`${product.title} handmade license plate frame`}
                fill
                className="object-contain"
              />
            </div>
          </TiltCard>

          <div>
            <span className="inline-block rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold tracking-widest text-neutral-500">
              3D PRINTED • HAND-POURED EPOXY
            </span>

            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
              {product.title}
            </h1>

            <p className="mt-6 whitespace-pre-line text-neutral-600">
              {product.description}
            </p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Link
                href={product.etsy}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-blue-600 px-6 py-3 text-center text-white hover:bg-blue-500"
              >
                Shop on Etsy
              </Link>

              <Link
                href="/#products"
                className="rounded-full border border-neutral-300 px-6 py-3 text-center hover:bg-neutral-100"
              >
                View More Frames
              </Link>
            </div>

            <div className="mt-10 text-xs leading-relaxed text-neutral-400">
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
