"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import EmptyCart from "@/components/cart/EmptyCart";
import CartItem from "@/components/cart/CartItem";
import Applyrequest from "@/components/cart/applyrequest";
import Loading from "@/app/[locale]/cart/loading";

async function fetchCart() {
  const res = await fetch("/api/cart", { cache: "no-store" });
  if (!res.ok) {
    return [];
  }

  const result = await res.json();

  return result.data ?? [];
}

export default function CartClient() {
  const t = useTranslations("Cart" as any);

  const { data, isLoading } = useQuery({
    queryKey: ["cartPage"],
    queryFn: fetchCart,
    staleTime: 1000 * 60 * 5, // 5 minutes - prevent unnecessary refetch
    // refetchOnMount: false, // Don't refetch if data already exists
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,

    retry: false,
  });

  const initialData = data || [];
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ───────────── Header ───────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-lime-500/30">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t("shopping_cart")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {initialData.length} {t("items")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ───────────── Main ───────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Loading */}
        {isLoading && <Loading />}

        {/* Empty */}
        {initialData.length === 0 && !isLoading && <EmptyCart />}

        {/* Filled */}
        {initialData.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 xl:gap-12 items-start">
            {/* ── Cart Items ── */}
            <section aria-label={t("items_label")} className="space-y-4">
              {/* Items container */}
              <div className="space-y-3">
                {initialData.map((item: any, index: any) => (
                  <div
                    key={item.product.id + item.size}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <CartItem item={item as any} index={index} />
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <button
                type="button"
                className="
                    group w-full flex items-center justify-center gap-2
                    py-4 px-6 mt-3
                    rounded-2xl
                    border border-dashed border-slate-300
                    text-slate-500 text-sm font-medium
                    hover:border-lime-500 hover:text-lime-600
                    hover:bg-lime-50/40
                    transition-all duration-300
                  "
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-200" />
                <span>{t("continue_shopping")}</span>
              </button>
            </section>

            {/* ── Order Summary ── */}
            <aside
              aria-label={t("order_summary")}
              className="lg:sticky lg:top-6"
            >
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 sm:p-5">
                <Applyrequest data={initialData as any} />
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
