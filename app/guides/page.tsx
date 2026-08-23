import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides | MyFramely",
  description: "Personalized license plate rules, costs, and ideas — state by state.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  const pillars = guides.filter((g) => g.role === "PILLAR");
  const rest = guides.filter((g) => g.role !== "PILLAR");

  return (
    <main className="min-h-screen px-6 py-12 text-neutral-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold md:text-4xl">Guides</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Personalized license plate rules, costs, and ideas — state by state.
        </p>

        <div className="mt-8 space-y-4">
          {[...pillars, ...rest].map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:border-blue-300"
            >
              <h2 className="text-lg font-semibold">{guide.title}</h2>
              <p className="mt-1 text-sm text-neutral-500">{guide.metaDescription}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
