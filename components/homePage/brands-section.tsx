// ── Brands Section — inline SVG only, zero network ───────────

const BRANDS = [
  { id: "nike", label: "Nike", w: 80 },
  { id: "columbia", label: "Columbia", w: 130 },
  { id: "under-armour", label: "Under Armour", w: 110 },
  { id: "carhartt", label: "Carhartt", w: 110 },
  { id: "patagonia", label: "Patagonia", w: 120 },
  { id: "north-face", label: "The North Face", w: 100 },
  { id: "wrangler", label: "Wrangler", w: 110 },
  { id: "dickies", label: "Dickies", w: 90 },
];

function BrandSvg({ id, label }: { id: string; label: string }) {
  switch (id) {
    case "nike":
      return (
        <svg viewBox="0 0 100 35" fill="currentColor" aria-label={label} width="100%" height="100%">
          <path d="M9 28L48 4c3.5-2.2 7-2 9 .5l1.5 2.5c1.5 3-.5 6.5-4 8.5L18 28H9z" />
        </svg>
      );
    case "columbia":
      return (
        <svg viewBox="0 0 140 35" aria-label={label} width="100%" height="100%">
          <text x="0" y="26" fontSize="20" fontWeight="800" fontFamily="Georgia,serif" letterSpacing="-0.5" fill="currentColor">COLUMBIA</text>
        </svg>
      );
    case "under-armour":
      return (
        <svg viewBox="0 0 110 35" fill="currentColor" aria-label={label} width="100%" height="100%">
          <path d="M16 6v15c0 5.5 3.5 9 9 9s9-3.5 9-9V6h-5v15c0 2.2-1.5 3.5-4 3.5s-4-1.3-4-3.5V6h-5z" />
          <path d="M44 6h5l7 20 7-20h5L57 30h-7L44 6z" />
        </svg>
      );
    case "carhartt":
      return (
        <svg viewBox="0 0 130 35" aria-label={label} width="100%" height="100%">
          <text x="0" y="26" fontSize="18" fontWeight="900" fontFamily="Arial,sans-serif" letterSpacing="1.5" fill="currentColor">CARHARTT</text>
        </svg>
      );
    case "patagonia":
      return (
        <svg viewBox="0 0 130 35" aria-label={label} width="100%" height="100%">
          <text x="0" y="26" fontSize="20" fontWeight="700" fontFamily="Georgia,serif" fill="currentColor">Patagonia</text>
        </svg>
      );
    case "north-face":
      return (
        <svg viewBox="0 0 50 50" fill="currentColor" aria-label={label} width="100%" height="100%">
          <circle cx="25" cy="25" r="22" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M14 34 L25 14 L36 34 Z" strokeLinejoin="round"/>
          <path d="M19 34 L25 24 L31 34 Z" fill="white"/>
        </svg>
      );
    case "wrangler":
      return (
        <svg viewBox="0 0 120 35" aria-label={label} width="100%" height="100%">
          <text x="0" y="27" fontSize="22" fontWeight="800" fontFamily="Georgia,serif" fill="currentColor">Wrangler</text>
        </svg>
      );
    case "dickies":
      return (
        <svg viewBox="0 0 100 35" aria-label={label} width="100%" height="100%">
          <text x="0" y="27" fontSize="22" fontWeight="900" fontFamily="Arial Black,sans-serif" fill="currentColor">Dickies</text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 35" aria-label={label} width="100%" height="100%">
          <text x="0" y="25" fontSize="16" fontWeight="700" fontFamily="Georgia,serif" fill="currentColor">{label}</text>
        </svg>
      );
  }
}

const TRACK = [...BRANDS, ...BRANDS];

export function BrandsSection() {
  return (
    <section
      className="py-12 sm:py-16 bg-white border-y border-stone-100 overflow-hidden"
      aria-label="Our partner brands"
    >
      <p className="text-center text-[11px] font-bold tracking-[0.25em] uppercase text-stone-400 mb-9">
        Trusted Brands
      </p>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 inset-y-0 w-16 sm:w-24 z-10"
          style={{ background: "linear-gradient(to right, white, transparent)" }} />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-16 sm:w-24 z-10"
          style={{ background: "linear-gradient(to left, white, transparent)" }} />

        <div
          className="flex items-center gap-10 sm:gap-14 w-max animate-marquee hover:[animation-play-state:paused]"
          aria-hidden="true"
        >
          {TRACK.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="shrink-0 text-stone-300 hover:text-stone-600 transition-colors duration-200"
              style={{ width: brand.w, height: 32 }}
              title={brand.label}
            >
              <BrandSvg id={brand.id} label={brand.label} />
            </div>
          ))}
        </div>
      </div>

      <ul className="sr-only">
        {BRANDS.map((b) => <li key={b.id}>{b.label}</li>)}
      </ul>
    </section>
  );
}
