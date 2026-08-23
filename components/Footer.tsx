import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-page px-6 py-8 text-sm text-neutral-500">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} MyFramely</p>
        <nav className="flex gap-6">
          <Link href="/guides" className="hover:text-neutral-900">
            Guides
          </Link>
          <Link href="/contact" className="hover:text-neutral-900">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-neutral-900">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-neutral-900">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
