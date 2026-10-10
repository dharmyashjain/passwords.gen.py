import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-24 text-center">
      <p className="animate-wiggle font-display text-8xl font-bold text-bubble [-webkit-text-stroke:2px_var(--color-ink)]">404</p>
      <h1 className="mt-4 text-3xl font-bold">This page got lost in the press</h1>
      <Link href="/" className="btn-primary mt-8">Back home</Link>
    </div>
  );
}
