import type { Metadata } from "next";
import { display } from "@/lib/fonts";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | MyFramely",
  description: "Questions about an order, a custom frame, or anything else? Send us a message and we'll get back to you by email.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className={`${display.className} text-3xl uppercase tracking-wide text-ink md:text-4xl`}>Contact Us</h1>
        <div className="chrome-hairline mt-4 w-16" />
        <p className="mt-4 text-sm text-ink-soft">
          Questions about an order, a custom frame, or anything else? Send us a message below and we&apos;ll reply by
          email.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
