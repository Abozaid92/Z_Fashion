"use client";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Gift,
  AlertTriangleIcon,
  Car,
  TrendingUp,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CartItemType } from "@/app/[locale]/utils/productType";
import { couponCode } from "@/lib/constants";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import Image from "next/image";
interface typeProps {
  data: CartItemType[];
  showOrderItem?: boolean;
}
const Applyrequest = ({ data, showOrderItem = false }: typeProps) => {
  const t = useTranslations("Applyrequest" as any);
  const codeRef = useRef<HTMLInputElement>(null);
  const [gift, setGift] = useState<Boolean>(null!);

  const subTotal = useMemo(() => {
    const total = data.reduce((acc, current) => {
      let cupon = gift ? 40 : 0;
      return acc + +current.product.price * current.quantity;
    }, 0);
    return total;
  }, [data]);

  const chargeCoast = useMemo(() => {
    return (subTotal * 5) / 100;
  }, [subTotal]);

  const total = useMemo(() => {
    return gift ?
        ((subTotal - chargeCoast) * 40) / 100
      : subTotal - chargeCoast;
  }, [subTotal, chargeCoast, gift]);

  function setPromoCode() {
    if (couponCode === codeRef.current?.value) {
      setGift(true);
    } else {
      setGift(false);
    }
    return 1;
  }

  return (
    <>
      <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Summary header */}
        <div className="px-6 py-5 border-b border-slate-100  items-center justify-between">
          <div className="flex items-center mb-5 justify-between border-b border-slate-100 pb-4">
            <div className=" flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-lime-500 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                {t("order_summary")}
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 rounded-full px-2.5 py-1">
              {t("items_count", { count: data.length })}
            </span>
          </div>

          {showOrderItem && (
            <ul className="space-y-4" aria-label={t("cart_items_aria")}>
              {data.slice(0, 2).map((item) => (
                <li key={item.id} className="flex gap-3">
                  {/* ... كود الصورة والبيانات كما هو ... */}
                  <div className="relative flex-shrink-0">
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white ring-2 ring-white">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-center gap-0.5 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.product.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {item.size}
                    </p>
                  </div>

                  <p className="flex-shrink-0 self-center text-sm font-bold text-slate-800">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}

              {/* زر Show More المنسق */}
              {data.length > 2 && (
                <li className="pt-2 cusrsor-pointer">
                  <Link
                    href={"/cart"}
                    className="group flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 py-2 text-xs font-medium text-slate-500 transition-all hover:border-emerald-500/50 hover:bg-emerald-50/50 hover:text-emerald-600"
                  >
                    <span>{t("show_more", { count: data.length - 2 })}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
        {/* Applyrequest injects promo + pricing + CTA */}
        {/* ── Promo Code ─────────────────────────────────────────────── */}
        <section
          aria-label={t("promo_aria")}
          className="px-6 pt-6 pb-4 space-y-3"
        >
          <label
            htmlFor="promo-input"
            className="block text-xs font-semibold uppercase tracking-widest text-slate-400"
          >
            {t("promo_label")}
          </label>

          <div className="flex gap-2">
            <input
              ref={codeRef}
              id="promo-input"
              type="text"
              placeholder={t("promo_placeholder")}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setPromoCode()}
              className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-lime-500 transition-all duration-300 cursor-pointer whitespace-nowrap"
            >
              {t("apply_button")}
            </button>
          </div>

          {/* Coupon feedback */}
          {gift !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium ${
                gift ?
                  "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-rose-50 text-rose-600 border border-rose-100"
              }`}
            >
              {gift ?
                <Gift className="w-4 h-4 flex-shrink-0" />
              : <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />}
              <span>
                {gift ?
                  t("coupon_success", { code: couponCode })
                : t("coupon_error")}
              </span>
            </motion.div>
          )}
        </section>
        {/* ── Price Breakdown ─────────────────────────────────────────── */}
        <section
          aria-label={t("price_details_aria")}
          className="px-6 py-5 space-y-3 border-t border-slate-100"
        >
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>{t("subtotal")}</span>
            <span className="font-semibold text-slate-700">
              {subTotal.toFixed(2)}$
            </span>
          </div>

          {gift && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between items-center text-sm"
            >
              <span className="flex items-center gap-1.5 text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                {t("discount_label")}
              </span>
              <span className="font-bold text-emerald-600">−40%</span>
            </motion.div>
          )}

          <div className="flex justify-between items-center text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-emerald-500" />
              {t("shipping_label")}
            </span>
            <span className="font-semibold text-slate-700">
              {chargeCoast.toFixed(2)}$
            </span>
          </div>
        </section>
        {/* ── Grand Total ─────────────────────────────────────────────── */}
        <section
          aria-label={t("grand_total_aria")}
          className="px-6 py-5 border-t-2 border-dashed border-slate-100"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              {t("grand_total_label")}
            </span>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-lime-500 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              {total.toFixed(2)}$
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{t("vat_note")}</p>
        </section>
        {/* ── Checkout CTA ─────────────────────────────────────────────── */}
        {!showOrderItem && (
          <div className="px-6 pb-6">
            <Link
              href={"/payment"}
              className="relative w-full overflow-hidden rounded-2xl bg-slate-900 text-white px-6 py-4 text-sm font-bold tracking-wide cursor-pointer group transition-all duration-300 hover:shadow-[0_8px_30px_-6px_rgba(132,204,22,0.5)] flex items-center justify-center gap-2"
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">{t("checkout_button")}</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        )}
        {/* ── Trust Badges ─────────────────────────────────────────────── */}
        <div className="px-6 pb-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
          {[
            {
              key: "safe_payment",
              path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            {
              key: "quality",
              path: "M5 13l4 4L19 7",
            },
            {
              key: "free_returns",
              path: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
            },
          ].map(({ key, path }) => (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-lime-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={path}
                  />
                </svg>
              </div>
              <p className="text-[10px] text-slate-500 text-center leading-tight">
                {t(`trust.${key}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Applyrequest;
