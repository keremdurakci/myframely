import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides } from "@/lib/guides";
import MarkdownContent from "@/components/MarkdownContent";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://www.myframely.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return {};

  return {
    title: `${guide.title} | MyFramely`,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url: `/guides/${guide.slug}`,
      siteName: "MyFramely",
      type: "article",
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();

  const guideUrl = `${SITE_URL}/guides/${guide.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    author: { "@type": "Organization", name: "MyFramely" },
    publisher: { "@type": "Organization", name: "MyFramely" },
    datePublished: guide.updatedDate,
    dateModified: guide.updatedDate,
    mainEntityOfPage: guideUrl,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: guideUrl },
    ],
  };

  return (
    <main className="min-h-screen px-6 py-12 text-neutral-900">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="mx-auto max-w-2xl">
        <Link href="/guides" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← All guides
        </Link>
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">{guide.title}</h1>
        <p className="mt-2 text-xs text-neutral-400">Updated {guide.updatedDate}</p>
        <div className="mt-6">
          <MarkdownContent content={guide.content} />
        </div>
      </div>
    </main>
  );
}
