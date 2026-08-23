import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | MyFramely",
  description: "How MyFramely collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-12 text-neutral-900">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated: August 16, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-700">
          <section>
            <p>
              This policy explains what personal information MyFramely (&quot;MyFramely,&quot; &quot;we,&quot;
              &quot;us&quot;) collects through myframely.com, why we collect it, and how it&apos;s handled. MyFramely
              has no user accounts or login system — we only collect information you give us directly when you make
              a purchase or contact us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Information We Collect</h2>
            <p className="mt-2">We collect different information depending on what you do on the site:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Plate availability checks:</strong> the plate text and state you search for. This isn&apos;t
                tied to your identity in any way.
              </li>
              <li>
                <strong>Plate Watch purchases:</strong> your email address, collected through Stripe&apos;s checkout
                page, so we can email you if your watched plate becomes available.
              </li>
              <li>
                <strong>Frame orders:</strong> your email address, name, and shipping address, collected through
                Stripe&apos;s checkout page, so we can ship your order.
              </li>
              <li>
                <strong>Payment details:</strong> we never see or store your card number. All payment processing is
                handled directly by Stripe, our payment processor.
              </li>
              <li>
                <strong>Contact form:</strong> the name, email, and message you submit when you contact us.
              </li>
              <li>
                <strong>Site analytics:</strong> standard usage data (pages visited, general location, device type)
                collected automatically through Google Analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">How We Use Your Information</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>To fulfill and ship frame orders.</li>
              <li>To run Plate Watch — checking availability on your behalf and emailing you when it changes.</li>
              <li>To respond to messages you send us.</li>
              <li>To understand how the site is used and improve it.</li>
            </ul>
            <p className="mt-2">We do not sell your personal information, and we do not use it for advertising.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">How We Share Your Information</h2>
            <p className="mt-2">
              We share information only with the service providers we use to run the site, and only as much as each
              one needs to do its job:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Stripe</strong> — processes payments and collects your shipping address at checkout.
              </li>
              <li>
                <strong>Resend</strong> — sends order and Plate Watch emails on our behalf.
              </li>
              <li>
                <strong>Supabase</strong> — stores order and Plate Watch records.
              </li>
              <li>
                <strong>Google Analytics</strong> — provides site usage analytics.
              </li>
            </ul>
            <p className="mt-2">
              We don&apos;t share your information with anyone else, except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Cookies &amp; Analytics</h2>
            <p className="mt-2">
              We use Google Analytics cookies to understand site traffic. Stripe&apos;s checkout page may also set
              its own cookies while you&apos;re completing a payment — this is outside our direct control and
              governed by Stripe&apos;s own privacy policy. We don&apos;t use any advertising or tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Data Retention</h2>
            <p className="mt-2">
              We keep order and Plate Watch records for as long as needed to fulfill your order, provide the service
              you paid for, and meet our own recordkeeping obligations. You can ask us to delete your information at
              any time — see &quot;Your Rights&quot; below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Your Rights</h2>
            <p className="mt-2">
              You can ask us to access, correct, or delete the personal information we hold about you at any time by{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                contacting us
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Children&apos;s Privacy</h2>
            <p className="mt-2">
              MyFramely is not directed at children under 13, and we do not knowingly collect personal information
              from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">International Visitors</h2>
            <p className="mt-2">
              We ship to the United States, Canada, and other countries. Because our service providers operate
              internationally, your information may be processed in countries other than the one you live in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Changes to This Policy</h2>
            <p className="mt-2">
              We may update this policy from time to time. Changes will be posted on this page with an updated
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Contact Us</h2>
            <p className="mt-2">
              Questions about this policy or your data?{" "}
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
