import type { Metadata } from "next";
import Link from "next/link";
import { display, plateMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Terms of Service | MyFramely",
  description: "The terms that apply when you buy a license plate frame from MyFramely.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className={`${display.className} text-3xl uppercase tracking-wide text-ink md:text-4xl`}>
          Terms of Service
        </h1>
        <p className={`${plateMono.className} mt-2 text-xs uppercase tracking-wide text-ink-soft`}>
          Last updated: August 16, 2026
        </p>
        <div className="chrome-hairline mt-4" />

        <div className="mt-8 space-y-8 rounded-lg border border-chrome/40 bg-white p-6 text-sm leading-relaxed text-ink-soft shadow-sm sm:p-8">
          <section>
            <p>
              By using myframely.com you agree to these terms. If you don&apos;t agree with them, please don&apos;t
              use the site.
            </p>
          </section>

          <section>
            <h2 className={`${plateMono.className} text-xs font-semibold uppercase tracking-widest text-ink`}>Our Services</h2>
            <p className="mt-2">MyFramely sells handmade, epoxy-finished license plate frames.</p>
          </section>

          <section>
            <h2 className={`${plateMono.className} text-xs font-semibold uppercase tracking-widest text-ink`}>Frame Orders</h2>
            <p className="mt-2">
              Frame prices vary by listing and are shown on Etsy at checkout, plus shipping ($15 to the US and other
              countries, $35 to Canada). Each frame is handmade and 3D-printed to order. Because each piece is
              individually handmade, slight variations from the product photos are normal and expected, not a
              defect.
            </p>
            <p className="mt-2">
              Since every frame is made to order, we&apos;re not able to offer returns or exchanges once production
              has started, except if your frame arrives damaged or defective — contact us within 7 days of delivery
              and we&apos;ll make it right.
            </p>
          </section>

          <section>
            <h2 className={`${plateMono.className} text-xs font-semibold uppercase tracking-widest text-ink`}>Intellectual Property</h2>
            <p className="mt-2">
              The MyFramely name, logo, site design, and product photography belong to MyFramely and may not be
              copied or reused without our permission.
            </p>
          </section>

          <section>
            <h2 className={`${plateMono.className} text-xs font-semibold uppercase tracking-widest text-ink`}>Limitation of Liability</h2>
            <p className="mt-2">
              MyFramely&apos;s products are provided &quot;as is.&quot; To the extent permitted by law, MyFramely
              isn&apos;t liable for indirect, incidental, or consequential damages arising from your use of the site
              or our products.
            </p>
          </section>

          <section>
            <h2 className={`${plateMono.className} text-xs font-semibold uppercase tracking-widest text-ink`}>Changes to These Terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Changes will be posted on this page with an updated
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className={`${plateMono.className} text-xs font-semibold uppercase tracking-widest text-ink`}>Contact Us</h2>
            <p className="mt-2">
              Questions about these terms?{" "}
              <Link href="/contact" className="text-ontario hover:underline">
                Contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
