import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label="Printza home">
      <span className="relative grid size-10 place-items-center rounded-2xl border-2 border-ink bg-sun shadow-pop-sm transition-transform group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
          <circle cx="8" cy="9" r="4" fill="var(--color-sky)" stroke="var(--color-ink)" strokeWidth="1.6" />
          <circle cx="16" cy="9" r="4" fill="var(--color-bubble)" stroke="var(--color-ink)" strokeWidth="1.6" />
          <circle cx="12" cy="15.5" r="4" fill="var(--color-mint)" stroke="var(--color-ink)" strokeWidth="1.6" />
        </svg>
      </span>
      <span className="font-display text-2xl font-bold tracking-tight">
        print<span className="text-bubble [-webkit-text-stroke:1px_var(--color-ink)]">za</span>
      </span>
    </Link>
  );
}
