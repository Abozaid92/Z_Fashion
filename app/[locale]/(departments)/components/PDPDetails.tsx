"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import StarRating from "./StarRating";
import type { ProductDetail, Size } from "./product";
import { cn } from "../../_lib/utils";
import ProductDiffrentActions from "./ProductDiffrentActions";

const SIZE_LABELS: Record<Size, string> = {
  Small: "S",
  Medium: "M",
  Large: "L",
  XLarge: "XL",
};

const COLORS = [
  { name: "Blue", hex: "#93c5fd" },
  { name: "White", hex: "#f8fafc" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Beige", hex: "#d4c5a9" },
];

interface PDPDetailsProps {
  product: ProductDetail;
  totalReviews: number;
}

export default function PDPDetails({ product, totalReviews }: PDPDetailsProps) {
  const t: any = useTranslations();
  const [selSize, setSelSize] = useState<Size | "">("");
  const [selColor, setSelColor] = useState(COLORS[0].name);
  const [sizeError, setSizeError] = useState(false);

  const salePrice =
    product.discount && product.discount > 0 ?
      Math.round(product.price * (1 - product.discount / 100))
    : null;

  const triggerSizeError = () => {
    setSizeError(true);
    setTimeout(() => setSizeError(false), 2500);
  };

  return (
    <div className="sticky top-20 rounded-2xl border border-stone-200 bg-white p-6">
      {/* Brand */}
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[.1em] text-stone-500">
        {product.brand}
      </p>

      {/* Name */}
      <h1
        className="mb-3 text-[22px] font-bold leading-snug text-stone-900"
        style={{ fontFamily: "Georgia,'Times New Roman',serif" }}
      >
        {product.name}
      </h1>

      {/* Rating */}
      <div className="mb-4 flex items-center gap-2">
        <StarRating rating={product.rating} size={14} showValue />
        <span className="text-[12px] text-stone-500">
          ({totalReviews.toLocaleString()} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="mb-5 flex flex-wrap items-baseline gap-3">
        <span className="text-[26px] font-bold tabular-nums text-stone-900">
          EGP {(salePrice ?? product.price).toLocaleString()}
        </span>
        {salePrice && (
          <>
            <span className="text-[16px] tabular-nums text-stone-400 line-through">
              EGP {product.price.toLocaleString()}
            </span>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
              {t("PDPDetails.save_percent", {
                percent: String(product.discount),
              })}
            </span>
          </>
        )}
      </div>

      {/* Color */}
      <div className="mb-5">
        <p className="mb-2 text-[12px] font-semibold text-stone-600">
          {t("PDPDetails.color_label")}{" "}
          <span className="font-normal text-stone-500">{selColor}</span>
        </p>
        <div className="flex gap-2" role="radiogroup" aria-label="Color">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelColor(c.name)}
              aria-label={c.name}
              aria-pressed={selColor === c.name}
              className={cn(
                "size-7 rounded-full border-2 transition-all",
                selColor === c.name ?
                  "border-stone-900 outline outline-2 outline-offset-2 outline-stone-900"
                : "border-stone-200 hover:border-stone-400",
              )}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mb-6">
        <p
          className={cn(
            "mb-2 text-[12px] font-semibold transition-colors",
            sizeError ? "text-red-500" : "text-stone-600",
          )}
        >
          {sizeError ? t("PDPDetails.size_error") : t("PDPDetails.size_label")}
          {!sizeError && (
            <span className="font-normal text-stone-500">
              {" "}
              {selSize ?
                SIZE_LABELS[selSize as Size]
              : t("PDPDetails.select_size")}
            </span>
          )}
        </p>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Size"
        >
          {product.size.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSelSize(s);
                setSizeError(false);
              }}
              aria-pressed={selSize === s}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border text-[12px] font-medium transition-all",
                selSize === s ?
                  "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-400",
              )}
            >
              {SIZE_LABELS[s as Size]}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-1.5 flex items-center gap-1 text-[11px] text-stone-400 underline underline-offset-2 hover:text-stone-600"
        >
          {t("PDPDetails.size_guide")} <ChevronDown size={10} />
        </button>
      </div>

      {/* الأكشنز مفصولة هنا */}
      <ProductDiffrentActions
        productId={product.id}
        productName={product.name}
        productImage={product.image}
        selectedSize={selSize as string}
        onSizeError={triggerSizeError}
      />

      {/* Guarantees */}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-5">
        {[
          { icon: "↩", textKey: "PDPDetails.guarantees.free_returns" },
          { icon: "🔒", textKey: "PDPDetails.guarantees.secure_checkout" },
          { icon: "🚚", textKey: "PDPDetails.guarantees.fast_delivery" },
        ].map((g) => (
          <span
            key={g.textKey}
            className="flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1.5 text-[11px] text-stone-600"
          >
            <span aria-hidden="true">{g.icon}</span>
            {t(g.textKey)}
          </span>
        ))}
      </div>

      {/* Short description */}
      {product.description && (
        <p className="mt-4 border-t border-stone-100 pt-4 text-[12px] leading-relaxed text-stone-500">
          {product.description}
        </p>
      )}
    </div>
  );
}
