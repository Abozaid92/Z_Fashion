"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import type { PLPFilters, Size } from "./product";

// ─── Hero ─────────────────────────────────────────────────────────────────────
interface PLPHeroProps {
  title: string;
  subtitle?: string;
  count: number;
  heroImage?: string;
}

export function PLPHero({
  title,
  subtitle,
  count,
  heroImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=75",
}: PLPHeroProps) {
  const t: any = useTranslations();
  return (
    <section className="relative h-56 overflow-hidden sm:h-72">
      {/* Pre-allocate aspect ratio → zero CLS */}
      <Image
        src={heroImage}
        alt={`${title} fashion collection`}
        fill
        className="object-cover object-[center_35%]"
        priority
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right,rgba(0,0,0,.65) 0%,rgba(0,0,0,.25) 55%,transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Text */}
      <div className="absolute inset-0 flex items-center px-6 sm:px-10">
        <div>
          {subtitle && (
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[.15em] text-white/70">
              {subtitle}
            </p>
          )}
          <h1
            className="text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "Georgia,'Times New Roman',serif" }}
          >
            {title}
          </h1>
          <p className="mt-2 text-[13px] text-white/70">
            {count.toLocaleString()} {t("PLPParts.toolbar.products")}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "newest", labelKey: "PLPParts.sort.newest" },
  { value: "price-asc", labelKey: "PLPParts.sort.price_asc" },
  { value: "price-desc", labelKey: "PLPParts.sort.price_desc" },
  { value: "top-rated", labelKey: "PLPParts.sort.top_rated" },
  { value: "discount", labelKey: "PLPParts.sort.discount" },
] as const;

interface PLPToolbarProps {
  filters: PLPFilters;
  totalCount: number;
  onFilterChange: (patch: Partial<PLPFilters>) => void;
  onOpenDrawer: () => void;
}

export function PLPToolbar({
  filters,
  totalCount,
  onFilterChange,
  onOpenDrawer,
}: PLPToolbarProps) {
  const t: any = useTranslations();

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6">
      {/* Mobile filter toggle */}
      <button
        type="button"
        onClick={onOpenDrawer}
        className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-[12px] text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900 md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        <SlidersHorizontal size={13} />
        {t("PLPParts.toolbar.filters")}
      </button>

      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search
          size={13}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder={t("PLPParts.toolbar.search_placeholder")}
          value={filters.q}
          onChange={(e) => onFilterChange({ q: e.target.value, page: 1 })}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-8 pr-3 text-[13px] text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white"
        />
      </div>

      {/* Count */}
      <span className="ml-auto hidden text-[12px] text-stone-500 sm:block">
        {String(totalCount)} {t("PLPParts.toolbar.products")}
      </span>

      {/* Sort */}
      <select
        value={filters.sort}
        onChange={(e) =>
          onFilterChange({
            sort: e.target.value as PLPFilters["sort"],
            page: 1,
          })
        }
        className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-[12px] text-stone-700 outline-none transition hover:border-stone-300 focus:border-stone-400"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Show at most 7 page numbers with ellipsis
  const range: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) range.push(i);
  } else {
    range.push(1);
    if (page > 3) range.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      range.push(i);
    if (page < totalPages - 2) range.push("…");
    range.push(totalPages);
  }

  const btnBase =
    "flex h-9 min-w-[36px] items-center justify-center rounded-lg border px-2.5 text-[13px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500";

  const t: any = useTranslations();

  return (
    <nav className="flex justify-center gap-1.5 py-10">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={`${btnBase} border-stone-200 bg-white text-stone-700 hover:border-stone-300 disabled:cursor-not-allowed disabled:text-stone-300`}
      >
        ←
      </button>

      {range.map((r, idx) =>
        r === "…" ?
          <span
            key={`ellipsis-${idx}`}
            className="flex h-9 w-9 items-center justify-center text-stone-400"
          >
            …
          </span>
        : <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            aria-current={page === r ? "page" : undefined}
            className={`${btnBase} ${
              page === r ?
                "border-stone-900 bg-stone-900 font-semibold text-white"
              : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
            }`}
          >
            {r}
          </button>,
      )}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={`${btnBase} border-stone-200 bg-white text-stone-700 hover:border-stone-300 disabled:cursor-not-allowed disabled:text-stone-300`}
      >
        →
      </button>
    </nav>
  );
}
