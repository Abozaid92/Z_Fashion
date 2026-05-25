"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { useShowcaseProducts } from "@/hooks/use-showcase";
import { HorizontalProductScroll } from "./horizontal-product-scroll";
import { ProductCard } from "./product-card";

// ── Config ────────────────────────────────────────────────
const CAT_CONFIG: Record<string, any> = {
  Shirts: {
    label: "Men's_Collection",
    // notic !!!!!
    href: "/products?gender=shirts-men",
    accent: "men_describe",
    layout: "scroll",
    bg: "white",
  },
  jackets: {
    label: "Jackets",
    href: "/products?cat=jackets",
    accent: "jackets_describe",
    layout: "grid",
    bg: "white",
  },
  pants: {
    label: "men-pants",
    href: "/products?cat=pants",
    accent: "pants_describe",
    layout: "scroll",
    bg: "stone",
  },
  women: {
    label: "Accessories",
    href: "/products?cat=women",
    accent: "women_describe",
    layout: "grid",
    bg: "stone",
  },
};

const ORDER = ["Shirts", "jackets", "pants", "women"];

export function ShowcaseSection() {
  // الهوك بيتنادى مرة واحدة فوق خالص زي ما الكتاب بيقول
  const t = useTranslations("ShowcaseSection" as any);
  const { data: groups = [] } = useShowcaseProducts();

  if (!groups.length) return null;
  console.log(groups);
  return (
    <div aria-label="Product showcase" className="space-y-0">
      {groups.map((group, idx) => {
        const products = group.products ?? [];
        if (!products.length) return null;

        const catName = products[0]?.category?.name ?? ORDER[idx];
        const cfg = CAT_CONFIG[catName] ?? CAT_CONFIG["Shirts"];

        // 1. Horizontal Scroll Layout
        if (cfg.layout === "scroll") {
          return (
            <HorizontalProductScroll
              key={catName}
              title={cfg.label}
              accentLabel={cfg.accent}
              viewAllHref={cfg.href}
              products={products}
              bg={cfg.bg}
            />
          );
        }

        // 2. Responsive Minimalist Grid (1 Large + 4 Small)
        const bgCls = cfg.bg === "stone" ? "bg-stone-50" : "bg-white";

        return (
          <section
            key={catName}
            className={`${bgCls} py-12 sm:py-20 border-b border-stone-100`}
          >
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
              {/* Header - WhatsApp Style (Minimal & Clean) */}
              <div className="flex items-end justify-between mb-10 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-lime-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    {t(cfg.accent)}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-1">
                    {t(cfg.label)}
                  </h2>
                </div>
                <Link
                  href={cfg.href}
                  className="hidden sm:flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-lime-600 transition-colors uppercase tracking-widest"
                >
                  {t("explore_all")} <ArrowRight size={14} />
                </Link>
              </div>

              {/* The Grid - Optimized for 5-6 products */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {products.slice(0, 6).map((p, i) => {
                  // أول منتج بياخد مساحة أكبر في الديسكتوب فقط لكسر الرتابة
                  const isFeature = i === 0;

                  return (
                    <div
                      key={p.id}
                      className={`
                        relative group overflow-hidden rounded-sm bg-white border border-stone-100
                        ${isFeature ? "col-span-2 row-span-2 md:col-span-2 lg:col-span-3" : "col-span-1 md:col-span-1 lg:col-span-1.5"}
                      `}
                    >
                      <ProductCard
                        {...p}
                        // تحسين الـ LCP
                        priority={idx === 0 && isFeature}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Hover Overlay - Pure CSS */}
                      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-300 pointer-events-none" />
                    </div>
                  );
                })}

                {/* الكارت السادس: "View All" مدمج في الجريد */}
                <Link
                  href={cfg.href}
                  className="col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-sm hover:border-lime-500 hover:bg-lime-50/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-white transition-colors">
                    <ArrowRight size={20} />
                  </div>
                  <span className="mt-3 text-[11px] font-bold uppercase tracking-tighter text-stone-500 group-hover:text-stone-900">
                    View All {products.length - 5}+
                  </span>
                </Link>
              </div>

              {/* Mobile View More Button */}
              <div className="mt-8 sm:hidden">
                <Link
                  href={cfg.href}
                  className="flex items-center justify-center w-full py-4 bg-stone-950 text-white text-[11px] font-bold uppercase tracking-widest"
                >
                  View Entire Collection
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
