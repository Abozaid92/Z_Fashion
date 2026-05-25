import { useTranslations } from "next-intl";
import { ShoppingBasket, ArrowRight } from "lucide-react";
import React from "react";

const EmptyCart = () => {
  const t = useTranslations("EmptyCart" as any);
  return (
    <section
      aria-label={t("empty_cart_aria")}
      className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-sm mx-auto"
    >
      {/* Icon */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-lime-400/10 scale-[1.35] animate-pulse" />
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-lime-50 to-emerald-100 border border-lime-200/60 flex items-center justify-center shadow-inner">
          <ShoppingBasket
            className="w-12 h-12 text-lime-500"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Copy */}
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-3">
        {t("empty_cart_title")}
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed mb-10 max-w-xs">
        {t("empty_cart_description")}
      </p>

      {/* CTA */}
      <button
        type="button"
        className="group inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-lime-500 hover:shadow-[0_8px_30px_-6px_rgba(132,204,22,0.5)] hover:scale-[1.03] active:scale-[0.98]"
      >
        <span>{t("browse_products")}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
      </button>
    </section>
  );
};

export default EmptyCart;
