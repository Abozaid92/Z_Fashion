"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Tag, ChevronDown, Package, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ORDER_ITEMS, SHIPPING_METHODS } from "@/app/[locale]/utils/checkout";
import type { ShippingMethod } from "@/app/[locale]/utils/checkout";

type Props = {
  selectedShipping: ShippingMethod["id"];
  isMobile?: boolean;
};

export default function OrderSummary({
  selectedShipping,
  isMobile = false,
}: Props) {
  const t = useTranslations("OrderSummary" as any);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [expanded, setExpanded] = useState(!isMobile);

  const DEMO_COUPONS: Record<string, number> = {
    SAVE10: 10,
    LAUNCH20: 20,
    WELCOME15: 15,
  };

  const shipping =
    SHIPPING_METHODS.find((m) => m.id === selectedShipping) ??
    SHIPPING_METHODS[0];

  const subtotal = ORDER_ITEMS.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const discount = appliedCoupon ? DEMO_COUPONS[appliedCoupon] : 0;
  const discountAmount = (subtotal * discount) / 100;
  const taxRate = 0.08;
  const taxableAmount = subtotal - discountAmount + shipping.price;
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + tax;

  function handleApplyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (DEMO_COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try SAVE10 or LAUNCH20.");
      setAppliedCoupon(null);
    }
  }

  return (
    <aside
      aria-label={t("aria_label")}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      {/* Mobile toggle */}
      {isMobile && (
        <button
          type="button"
          className="flex w-full items-center justify-between p-4 cursor-pointer"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-controls="order-summary-content"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Package className="h-4 w-4 text-emerald-500" />
            {t("order_summary")}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-emerald-600">
              ${total.toFixed(2)}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
      )}

      <div
        id="order-summary-content"
        className={`transition-all duration-300 ${
          isMobile && !expanded ? "max-h-0 overflow-hidden" : "max-h-[9999px]"
        }`}
      >
        {/* Header */}
        {!isMobile && (
          <div className="border-b border-slate-100 bg-gradient-to-br from-lime-50 to-emerald-50 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700">
              <Package className="h-4 w-4 text-emerald-500" />
              {t("order_summary")}
            </h2>
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* Coupon */}
          <div>
            <label
              htmlFor="coupon-input"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {t("discount_code")}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="coupon-input"
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder={t("coupon_placeholder")}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                  aria-describedby={couponError ? "coupon-error" : undefined}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {t("apply")}
              </button>
            </div>
            {couponError && (
              <p
                id="coupon-error"
                role="alert"
                className="mt-1.5 text-xs text-red-500"
              >
                {t("invalid_coupon")}
              </p>
            )}
            {appliedCoupon && (
              <p className="mt-1.5 text-xs font-medium text-emerald-600">
                ✓ {appliedCoupon} {t("applied_suffix", { percent: discount })}
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="rounded-xl bg-slate-50 p-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{t("subtotal")}</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{t("discount_label", { percent: discount })}</span>
                <span className="font-medium">
                  −${discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>{t("shipping")}</span>
              <span className="font-medium">
                {shipping.price === 0 ?
                  t("free")
                : `$${shipping.price.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t("estimated_tax")}</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2.5 flex justify-between">
              <span className="text-base font-bold text-slate-900">
                {t("total")}
              </span>
              <span className="text-base font-extrabold text-emerald-600">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t("secure_ssl")}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
