import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | MyFramely",
  description: "Questions about an order, a plate watch, or anything else? Send us a message and we'll get back to you by email.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen px-6 py-12 text-neutral-900">
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-semibold md:text-4xl">Contact Us</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Questions about an order, a Plate Watch, or anything else? Send us a message below and we&apos;ll reply by
          email.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
