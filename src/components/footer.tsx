import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div className="space-y-3">
          <div className="inline-block rounded-2xl bg-cream px-3 py-1.5 text-ink">
            <Logo />
          </div>
          <p className="max-w-xs text-cream/70">
            Bright, fast, fuss-free printing. Upload your design and we&apos;ll handle the rest.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-lg text-sun">Shop</h3>
          <ul className="space-y-2 text-cream/80">
            <li><Link href="/products/leaflet" className="hover:text-bubble">Leaflets</Link></li>
            <li><Link href="/products/pamphlet" className="hover:text-bubble">Pamphlets</Link></li>
            <li><Link href="/products/letterhead" className="hover:text-bubble">Letterheads</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-lg text-sun">Good to know</h3>
          <ul className="space-y-2 text-cream/80">
            <li>All prices in ₹, excluding GST</li>
            <li>Upload PDF, AI, CDR, PNG, JPG or TIFF</li>
            <li>Templates &amp; AI design: coming soon ✨</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-cream/15 py-5 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} Printza. Made with lots of ink.
      </p>
    </footer>
  );
}
