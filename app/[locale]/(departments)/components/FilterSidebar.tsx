"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "../../_lib/utils";
import type { PLPFilters, Size } from "./product";
// ─── Static data (label keys only; actual text resolved via `t()` inside component)
const CATEGORIES = [
  { slug: "", labelKey: "FilterSidebar.categories.All" },
  { slug: "shirts", labelKey: "FilterSidebar.categories.Shirts" },
  { slug: "pants", labelKey: "FilterSidebar.categories.Pants" },
  { slug: "t-shirts", labelKey: "FilterSidebar.categories.T-Shirts" },
  { slug: "jackets", labelKey: "FilterSidebar.categories.Jackets" },
  { slug: "knitwear", labelKey: "FilterSidebar.categories.Knitwear" },
  { slug: "hoodies", labelKey: "FilterSidebar.categories.Hoodies" },
  { slug: "polo", labelKey: "FilterSidebar.categories.Polo" },
  { slug: "shorts", labelKey: "FilterSidebar.categories.Shorts" },
];

const SIZES: Size[] = ["Small", "Medium", "Large", "XLarge"];
const SIZE_LABEL_KEYS: Record<Size, string> = {
  Small: "FilterSidebar.sizes.labels.Small",
  Medium: "FilterSidebar.sizes.labels.Medium",
  Large: "FilterSidebar.sizes.labels.Large",
  XLarge: "FilterSidebar.sizes.labels.XLarge",
};

const BRANDS = [
  { key: "Heritage", labelKey: "FilterSidebar.brands.Heritage" },
  { key: "Core", labelKey: "FilterSidebar.brands.Core" },
  { key: "Prestige", labelKey: "FilterSidebar.brands.Prestige" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface FilterSidebarProps {
  filters: PLPFilters;
  onChange: (patch: Partial<PLPFilters>) => void;
  /** mobile drawer open state */
  isOpen: boolean;
  onClose: () => void;
}

// ─── Section wrapper (collapsible) ────────────────────────────────────────────
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <details
      open
      className="group border-b border-stone-100 py-4 last:border-0"
    >
      <summary className="flex cursor-pointer select-none list-none items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded">
        <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-stone-500">
          {label}
        </span>
        <ChevronDown
          size={14}
          className="text-stone-400 transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function FilterSidebar({
  filters,
  onChange,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const t = useTranslations("");
  const toggleSize = useCallback(
    (s: Size) => {
      const next =
        filters.sizes.includes(s) ?
          filters.sizes.filter((x) => x !== s)
        : [...filters.sizes, s];
      onChange({ sizes: next, page: 1 });
    },
    [filters.sizes, onChange],
  );

  const clear = useCallback(() => {
    onChange({
      q: "",
      cat: "",
      min: 0,
      max: 0,
      sizes: [],
      sort: "newest",
      page: 1,
    });
    onClose();
  }, [onChange, onClose]);

  const panelContent = (
    <div className="flex flex-col gap-0">
      {/* Category */}
      <Section label={t("FilterSidebar.sections.category")}>
        <ul className="space-y-0.5" role="list">
          {CATEGORIES.map((c) => {
            const active = filters.cat === c.slug;
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => onChange({ cat: c.slug, page: 1 })}
                  className={cn(
                    "w-full rounded px-2 py-1.5 text-left text-[13px] transition-colors",
                    active ?
                      "font-semibold text-stone-900 bg-stone-100"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50",
                  )}
                  aria-pressed={active}
                >
                  {t(c.labelKey)}
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Size */}
      <Section label={t("FilterSidebar.sections.size")}>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("FilterSidebar.aria.size_filter")}
        >
          {SIZES.map((s) => {
            const active = filters.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                aria-pressed={active}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border text-[12px] font-medium transition-all",
                  active ?
                    "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-400",
                )}
              >
                {t(SIZE_LABEL_KEYS[s])}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Brand */}
      <Section label={t("FilterSidebar.sections.brand")}>
        <div className="space-y-2">
          {BRANDS.map((b) => (
            <label
              key={b.key}
              className="flex cursor-pointer items-center gap-2.5 text-[13px] text-stone-600 hover:text-stone-900"
            >
              <input
                type="checkbox"
                className="size-3.5 rounded border-stone-300 accent-stone-900"
                checked={false /* wire to filter state if needed */}
                onChange={() => {}}
              />
              {t(b.labelKey)}
            </label>
          ))}
        </div>
      </Section>

      {/* Price range */}
      <Section label={t("FilterSidebar.sections.price_egp")}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t("FilterSidebar.placeholders.min")}
            value={filters.min || ""}
            onChange={(e) =>
              onChange({ min: parseInt(e.target.value) || 0, page: 1 })
            }
            min={0}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[12px] text-stone-900 outline-none focus:border-stone-400"
            aria-label={t("FilterSidebar.aria.min_price")}
          />
          <span className="text-stone-300">–</span>
          <input
            type="number"
            placeholder={t("FilterSidebar.placeholders.max")}
            value={filters.max || ""}
            onChange={(e) =>
              onChange({ max: parseInt(e.target.value) || 0, page: 1 })
            }
            min={0}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[12px] text-stone-900 outline-none focus:border-stone-400"
            aria-label={t("FilterSidebar.aria.max_price")}
          />
        </div>
      </Section>

      {/* Clear */}
      <button
        type="button"
        onClick={clear}
        className="mt-2 w-full rounded-lg border border-stone-200 py-2.5 text-[12px] text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-700"
      >
        {t("FilterSidebar.actions.clear_all_filters")}
      </button>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (sticky, always visible ≥ md) ─────────────── */}
      <aside
        className="hidden w-[210px] shrink-0 md:block"
        aria-label={t("FilterSidebar.aria.product_filters")}
      >
        <div className="sticky top-20">{panelContent}</div>
      </aside>

      {/* ── Mobile backdrop ────────────────────────────────────────────── */}
      {/*
       *  CSS-only slide: the drawer uses `translate-x-[-100%]` when closed
       *  and `translate-x-0` when open. NO JS animation, only Tailwind
       *  transition utilities → satisfies "0 JS for the slide effect".
       */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          "transition-opacity duration-300",
          isOpen ?
            "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,.40)" }}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-stone-50 md:hidden",
          "transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <span className="text-[13px] font-semibold text-stone-900">
            {t("FilterSidebar.sections.filters")}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("FilterSidebar.aria.close_filters")}
            className="flex size-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-2">{panelContent}</div>
      </aside>
    </>
  );
}
