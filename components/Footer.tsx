import Link from "next/link";
import { plateMono } from "@/lib/fonts";

export default function Footer() {
  return (
    <footer className="relative bg-ink px-6 py-8 text-sm text-plate-soft">
      <div className="chrome-hairline absolute inset-x-0 top-0" />
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className={plateMono.className}>&copy; {new Date().getFullYear()} MyFramely</p>
        <nav className="flex gap-6">
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
