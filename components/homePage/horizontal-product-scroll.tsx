"use client";

import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { ProductCard, type ProductCardData } from "./product-card";

interface HorizontalProductScrollProps {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  products: ProductCardData[];
  bg?: "white" | "stone";
  accentLabel?: string;
}

/* ──────────────────────────────────────────────────────────
   Mobile Scroll (Repeated 4 times)
────────────────────────────────────────────────────────── */
const MobileInfiniteRow = memo(
  ({ products }: { products: ProductCardData[] }) => {
    // duplicate products 4 times
    const duplicated = useMemo(
      () => [...products, ...products, ...products],
      [products],
    );

    return (
      <div className="md:hidden relative">
        {/* fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent" />

        <div
          className="
            flex gap-3 overflow-x-auto overflow-y-hidden
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
            snap-x snap-mandatory
            px-1
          "
        >
          {duplicated.map((product, index) => (
            <motion.div
              key={`${product.id}-${index}`}
              initial={{ opacity: 0.9 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="
                snap-start
                w-[46vw]
                min-w-[46vw]

                xs:w-[42vw]
                xs:min-w-[42vw]

                sm:w-[31vw]
                sm:min-w-[31vw]
              "
            >
              <ProductCard {...product} size="sm" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  },
);

MobileInfiniteRow.displayName = "MobileInfiniteRow";

/* ──────────────────────────────────────────────────────────
   Desktop Grid
────────────────────────────────────────────────────────── */
const DesktopGrid = memo(({ products }: { products: ProductCardData[] }) => {
  return (
    <div className="hidden md:grid grid-cols-4 gap-5">
      {products.slice(0, 8).map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.35,
            delay: index * 0.03,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ProductCard {...product} priority={index < 4} />
        </motion.div>
      ))}
    </div>
  );
});

DesktopGrid.displayName = "DesktopGrid";

/* ──────────────────────────────────────────────────────────
   Main Component
────────────────────────────────────────────────────────── */
export function HorizontalProductScroll({
  title,
  subtitle,
  viewAllHref,
  products,
  bg = "white",
  accentLabel,
}: HorizontalProductScrollProps) {
  const t = useTranslations("HorizontalProductScroll" as any);
  const r = useTranslations("ShowcaseSection" as any);

  const bgCls = bg === "stone" ? "bg-stone-50" : "bg-white";

  return (
    <section className={`${bgCls} py-12 sm:py-16 relative overflow-hidden`}>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            {accentLabel && (
              <p className="text-lime-600 text-[11px] font-bold tracking-[0.2em] uppercase mb-1.5">
                {r(accentLabel)}
              </p>
            )}

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-950 leading-tight">
              {r(title)}
            </h2>

            {subtitle && (
              <p className="text-stone-400 text-sm mt-1">{subtitle}</p>
            )}
          </div>

          <Link
            href={viewAllHref}
            className="
              shrink-0 hidden sm:inline-flex items-center gap-1.5
              text-[12px] font-bold text-stone-500
              hover:text-lime-600 uppercase tracking-wide
              transition-colors group
            "
          >
            {t("view_all")}

            <ArrowRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Desktop */}
        <DesktopGrid products={products} />

        {/* Mobile Row */}
        <MobileInfiniteRow products={products} />
      </div>

      {/* ── Mobile CTA ─────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 mt-10 sm:hidden flex justify-center">
        <Link
          href={viewAllHref}
          className="
            group inline-flex items-center gap-2
            px-7 py-3 rounded-full
            border border-stone-200
            hover:border-lime-500 hover:bg-lime-50
            text-stone-700 hover:text-lime-700
            text-[13px] font-bold uppercase tracking-wide
            transition-all duration-200
          "
        >
          {t("view_all_title").replace("{title}", title)}

          <ArrowRight
            size={13}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
