import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | MyFramely",
  description: "The terms that apply when you use MyFramely's plate finder tool or buy a license plate frame.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-12 text-neutral-900">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold md:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated: August 16, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-700">
          <section>
            <p>
              By using myframely.com you agree to these terms. If you don&apos;t agree with them, please don&apos;t
              use the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Our Services</h2>
            <p className="mt-2">MyFramely offers two things:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>A personalized license plate availability finder, with an optional paid Plate Watch alert.</li>
              <li>Handmade, epoxy-finished license plate frames for sale.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Plate Availability Is Not Guaranteed</h2>
            <p className="mt-2">
              Our availability checks are best-effort and based on data from official state DMV systems, which can
              change at any time. A plate shown as &quot;Available&quot; may already be taken by the time you apply
              for it, and a plate shown as &quot;Taken&quot; or &quot;Unknown&quot; may in fact be available.{" "}
              <strong>
                Always confirm availability directly with the official state DMV before paying any state fees or
                relying on a result from this site.
              </strong>{" "}
              MyFramely is not affiliated with any state DMV and is not responsible for a plate you wanted becoming
              unavailable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Plate Watch</h2>
            <p className="mt-2">
              Plate Watch is a one-time $2.99 purchase, not a subscription — it does not renew automatically. Once
              purchased, we check your chosen plate once a day for 30 days. If it becomes available, we&apos;ll email
              you and the watch ends. If it doesn&apos;t become available within 30 days, the watch simply expires;
              we don&apos;t charge you again. Because availability checks depend on official DMV systems outside our
              control, we can&apos;t guarantee a watched plate will ever become available, or that our check will
              catch it the instant it does.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Frame Orders</h2>
            <p className="mt-2">
              Each frame is $40 USD plus shipping ($15 to the US and other countries, $35 to Canada), handmade and
              3D-printed to order. Because each piece is individually handmade, slight variations from the product
              photos are normal and expected, not a defect.
            </p>
            <p className="mt-2">
              Since every frame is made to order, we&apos;re not able to offer returns or exchanges once production
              has started, except if your frame arrives damaged or defective — contact us within 7 days of delivery
              and we&apos;ll make it right.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Intellectual Property</h2>
            <p className="mt-2">
              The MyFramely name, logo, site design, and product photography belong to MyFramely and may not be
              copied or reused without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Limitation of Liability</h2>
            <p className="mt-2">
              MyFramely&apos;s plate finder tool and products are provided &quot;as is.&quot; To the extent permitted
              by law, MyFramely isn&apos;t liable for indirect, incidental, or consequential damages arising from
              your use of the site or our products, including a plate becoming unavailable or a Plate Watch not
              catching a match in time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Changes to These Terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Changes will be posted on this page with an updated
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Contact Us</h2>
            <p className="mt-2">
              Questions about these terms?{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
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
