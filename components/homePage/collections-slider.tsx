"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useRef, useState, useEffect, useCallback } from "react";

const COLLECTIONS = [
  {
    id: "buck-commander",
    title: "Buck Commander®",
    tagline: "For the love of the hunt",
    href: "/collections/buck-commander",
    image:
      "https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=700&q=80",
  },
  {
    id: "tough-as-buck",
    title: "Tough As Buck",
    tagline: "Honoring our hunting heritage",
    href: "/collections/tough-as-buck",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80",
  },
  {
    id: "outdoors",
    title: "Outdoors",
    tagline: "Engineered for performance",
    href: "/collections/outdoors",
    image:
      "https://images.unsplash.com/photo-1526647882-3b7e0f0a3e35?w=700&q=80",
  },
  {
    id: "heritage",
    title: "Heritage Line",
    tagline: "Rooted in tradition",
    href: "/collections/heritage",
    image:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=700&q=80",
  },
  {
    id: "modern-wild",
    title: "Modern Wild",
    tagline: "Where nature meets style",
    href: "/collections/modern-wild",
    image:
      "https://images.unsplash.com/photo-1619624094589-e5dd3f6c3d0a?w=700&q=80",
  },
  {
    id: "field-ready",
    title: "Field Ready",
    tagline: "Gear up for every season",
    href: "/collections/field-ready",
    image:
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=700&q=80",
  },
];

const INTERVAL = 2200;

export function CollectionsSlider() {
  const t = useTranslations("CollectionsSlider" as any);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null!);
  const pausedRef = useRef(false);
  const activeRef = useRef(0); // shadow ref to avoid stale closure

  const scrollToCard = useCallback((idx: number) => {
    const container = listRef.current;
    const card = cardRefs.current[idx];
    if (!container || !card) return;

    // offsetLeft of the card relative to the scroll container
    const containerLeft = container.getBoundingClientRect().left;
    const cardLeft = card.getBoundingClientRect().left;
    const currentScroll = container.scrollLeft;
    const target = currentScroll + (cardLeft - containerLeft) - 16;

    container.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  const advance = useCallback(() => {
    if (pausedRef.current) return;
    const next = (activeRef.current + 1) % COLLECTIONS.length;
    activeRef.current = next;
    setActiveIdx(next);
    scrollToCard(next);
  }, [scrollToCard]);

  const schedule = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      advance();
      schedule();
    }, INTERVAL);
  }, [advance]);

  useEffect(() => {
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [schedule]);

  const goTo = (i: number) => {
    activeRef.current = i;
    setActiveIdx(i);
    scrollToCard(i);
  };

  return (
    <section
      className="py-10 sm:py-14 bg-white overflow-hidden"
      aria-label="Legendary Collections"
    >
      {/* Header */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-lime-600 text-[11px] font-bold tracking-[0.2em] uppercase mb-1.5">
              {t("curated")}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 leading-tight">
              {t("legendary_collections")}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Dots desktop */}
            <div className="hidden md:flex items-center gap-1.5">
              {COLLECTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to collection ${i + 1}`}
                  className="rounded-full transition-all duration-300 focus:outline-none"
                  style={{
                    width: activeIdx === i ? 20 : 6,
                    height: 6,
                    background: activeIdx === i ? "#84cc16" : "#d6d3d1",
                  }}
                />
              ))}
            </div>
            <Link
              href="/collections"
              className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-600 hover:text-lime-600 transition-colors group"
            >
              {t("view_all")}
              <svg
                className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  d="M3 7h8M7 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div
        className="relative"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
          setHoveredId(null);
        }}
      >
        {/* Right fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10"
          style={{
            background: "linear-gradient(to right, transparent, white)",
          }}
          aria-hidden="true"
        />

        <div
          ref={listRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
          style={{
            paddingLeft: "max(1rem, calc((100vw - 1280px) / 2 + 1rem))",
            paddingRight: "4rem",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          role="list"
        >
          {COLLECTIONS.map((col, i) => (
            <CollectionCard
              key={col.id}
              col={col}
              eager={i < 4}
              index={i}
              isActive={activeIdx === i}
              isAnyHovered={hoveredId !== null}
              isSelfHovered={hoveredId === col.id}
              onHover={() => setHoveredId(col.id)}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>

      {/* Mobile dots + view all */}
      <div className="md:hidden mt-5 flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5">
          {COLLECTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to collection ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeIdx === i ? 18 : 6,
                height: 6,
                background: activeIdx === i ? "#84cc16" : "#d6d3d1",
              }}
            />
          ))}
        </div>
        <Link
          href="/collections"
          className="text-[13px] font-semibold text-stone-600 hover:text-lime-600 transition-colors underline underline-offset-4"
        >
          View all collections
        </Link>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CollectionCard — forwardRef so parent can read its DOM node
// ─────────────────────────────────────────────────────────────
import { forwardRef } from "react";

const CollectionCard = forwardRef<
  HTMLElement,
  {
    col: (typeof COLLECTIONS)[number];
    eager: boolean;
    index: number;
    isActive: boolean;
    isAnyHovered: boolean;
    isSelfHovered: boolean;
    onHover: () => void;
  }
>(function CollectionCard(
  { col, eager, isActive, isAnyHovered, isSelfHovered, onHover },
  ref,
) {
  const highlighted = isSelfHovered || isActive;

  const opacity =
    isAnyHovered ?
      isSelfHovered ? 1
      : 0.45
    : isActive ? 1
    : 0.72;

  const scale =
    isAnyHovered ?
      isSelfHovered ? 1
      : 0.96
    : isActive ? 1.02
    : 1;

  return (
    <article
      ref={ref as React.Ref<HTMLElement>}
      className="shrink-0 snap-start cursor-pointer"
      style={{
        width: "clamp(220px, 28vw, 310px)",
        opacity,
        transform: `scale(${scale})`,
        transition:
          "opacity 0.4s ease, transform 0.4s cubic-bezier(.25,.46,.45,.94)",
      }}
      role="listitem"
      onMouseEnter={onHover}
    >
      <Link href={col.href} aria-label={col.title}>
        {/* Image */}
        <div
          className="relative overflow-hidden rounded-xl bg-stone-200"
          style={{ height: "clamp(240px, 32vw, 360px)" }}
        >
          <Image
            src={col.image}
            alt={col.title}
            fill
            className="object-cover object-center"
            style={{
              transform: highlighted ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.7s cubic-bezier(.25,.46,.45,.94)",
            }}
            sizes="(max-width: 640px) 60vw, 310px"
            loading={eager ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          {/* Lime bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-lime-400"
            style={{
              transform: highlighted ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
              transition: "transform 0.45s cubic-bezier(.25,.46,.45,.94)",
            }}
          />

          {/* Title + Explore */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3
              className="font-display text-white font-bold text-lg sm:text-xl leading-tight"
              style={{
                transform: highlighted ? "translateY(-6px)" : "translateY(0)",
                transition: "transform 0.35s cubic-bezier(.25,.46,.45,.94)",
              }}
            >
              {col.title}
            </h3>
            <div
              style={{
                opacity: highlighted ? 1 : 0,
                transform: highlighted ? "translateY(0)" : "translateY(8px)",
                transition:
                  "opacity 0.3s ease 0.05s, transform 0.35s cubic-bezier(.25,.46,.45,.94) 0.05s",
              }}
            >
              <span className="mt-1.5 inline-flex items-center gap-1.5 text-lime-400 text-[12px] font-bold tracking-wide uppercase">
                Explore
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 12 12"
                  style={{
                    transform:
                      highlighted ? "translateX(3px)" : "translateX(0)",
                    transition: "transform 0.3s ease 0.1s",
                  }}
                >
                  <path
                    d="M2 6h8M6 2l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Badge */}
          <div
            className="absolute top-3 right-3"
            style={{
              opacity: highlighted ? 1 : 0,
              transform:
                highlighted ?
                  "scale(1) rotate(0deg)"
                : "scale(0.6) rotate(-15deg)",
              transition:
                "opacity 0.3s ease, transform 0.4s cubic-bezier(.34,1.56,.64,1)",
            }}
          >
            <span className="inline-block bg-lime-400 text-stone-950 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
              New
            </span>
          </div>
        </div>

        {/* Caption */}
        <p
          className="mt-2.5 text-[13px] sm:text-sm font-medium px-0.5 transition-colors duration-300"
          style={{ color: highlighted ? "#65a30d" : "#78716c" }}
        >
          {col.tagline}
        </p>
      </Link>
    </article>
  );
});
