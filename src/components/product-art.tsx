const INK = "var(--color-ink)";

export const productTheme: Record<string, { bg: string; soft: string; accent: string; emoji: string }> = {
  leaflet: { bg: "bg-bubble", soft: "bg-bubble-soft", accent: "var(--color-bubble)", emoji: "🎉" },
  pamphlet: { bg: "bg-sky", soft: "bg-sky-soft", accent: "var(--color-sky)", emoji: "📣" },
  letterhead: { bg: "bg-mint", soft: "bg-mint-soft", accent: "var(--color-mint)", emoji: "✍️" },
  visiting_card: { bg: "bg-grape", soft: "bg-grape-soft", accent: "var(--color-grape)", emoji: "💼" },
  envelope: { bg: "bg-peach", soft: "bg-sun-soft", accent: "var(--color-peach)", emoji: "💌" },
};

export function themeFor(slug: string) {
  return productTheme[slug] ?? productTheme.leaflet;
}

/** Hand-drawn style illustration for each product. */
export function ProductArt({ slug, className = "" }: { slug: string; className?: string }) {
  const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden>
      {slug === "leaflet" && (
        <g>
          <rect x="62" y="22" width="86" height="116" rx="6" fill="#fff" {...s} transform="rotate(8 105 80)" />
          <rect x="50" y="18" width="86" height="116" rx="6" fill="#fff" {...s} transform="rotate(-6 93 76)" />
          <g transform="rotate(-6 93 76)">
            <circle cx="93" cy="58" r="22" fill="var(--color-sun)" {...s} />
            <path d="M70 100 h46 M70 112 h30" {...s} />
            <path d="M84 52 l6 6 l12 -12" fill="none" {...s} />
          </g>
          <path d="M160 30 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" fill="var(--color-sun)" {...s} strokeWidth={2.4} />
          <circle cx="36" cy="120" r="7" fill="var(--color-sky)" {...s} strokeWidth={2.4} />
        </g>
      )}
      {slug === "pamphlet" && (
        <g>
          <path d="M40 34 l40 -10 v110 l-40 10 z" fill="#fff" {...s} />
          <path d="M80 24 l40 10 v110 l-40 -10 z" fill="var(--color-sun-soft)" {...s} />
          <path d="M120 34 l40 -10 v110 l-40 10 z" fill="#fff" {...s} />
          <circle cx="60" cy="64" r="10" fill="var(--color-bubble)" {...s} strokeWidth={2.4} />
          <path d="M50 92 l20 -5 M50 104 l20 -5" {...s} />
          <path d="M92 60 l16 4 M92 74 l16 4 M92 88 l16 4" {...s} />
          <rect x="128" y="56" width="22" height="22" rx="4" fill="var(--color-mint)" {...s} strokeWidth={2.4} transform="rotate(-8 139 67)" />
          <path d="M130 100 l20 -5" {...s} />
        </g>
      )}
      {slug === "letterhead" && (
        <g>
          <rect x="52" y="14" width="96" height="132" rx="6" fill="#fff" {...s} />
          <rect x="52" y="14" width="96" height="26" rx="6" fill="var(--color-grape)" {...s} />
          <circle cx="70" cy="27" r="6" fill="var(--color-sun)" {...s} strokeWidth={2.2} />
          <path d="M84 27 h44" {...s} stroke="#fff" />
          <path d="M66 60 h50 M66 74 h68 M66 88 h60 M66 102 h66" {...s} strokeWidth={2.6} />
          <path d="M100 124 c8 -10 14 4 22 -4 s10 2 14 -2" fill="none" {...s} strokeWidth={2.4} />
          <path d="M150 112 l26 -40 l8 6 l-26 40 l-10 4 z" fill="var(--color-bubble)" {...s} strokeWidth={2.4} />
        </g>
      )}
      {slug === "visiting_card" && (
        <g>
          <rect x="44" y="52" width="112" height="66" rx="8" fill="var(--color-sun)" {...s} transform="rotate(10 100 85)" />
          <rect x="40" y="44" width="112" height="66" rx="8" fill="#fff" {...s} transform="rotate(-6 96 77)" />
          <g transform="rotate(-6 96 77)">
            <circle cx="64" cy="70" r="11" fill="var(--color-bubble)" {...s} strokeWidth={2.4} />
            <path d="M84 66 h48 M84 78 h32 M56 96 h70" {...s} strokeWidth={2.6} />
          </g>
        </g>
      )}
      {slug === "envelope" && (
        <g>
          <rect x="34" y="40" width="132" height="88" rx="8" fill="#fff" {...s} />
          <path d="M34 48 l66 48 l66 -48" fill="var(--color-sky-soft)" {...s} />
          <path d="M100 74 c-8 -12 -26 -4 -16 10 l16 14 l16 -14 c10 -14 -8 -22 -16 -10 z" fill="var(--color-bubble)" {...s} strokeWidth={2.4} />
        </g>
      )}
    </svg>
  );
}
