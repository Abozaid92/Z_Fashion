"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Eye } from "lucide-react";
import { cn } from "../../_lib/utils";
import StarRating from "./StarRating";
import type { ProductCardData } from "./product";

// Lazy-load zoom overlay — 0 bytes added to initial bundle
const ZoomOverlay = dynamic(
  () => import("@/components/homePage/zoom-overlay"),
  {
    ssr: false,
    loading: () => null,
  },
);

interface ProductCardProps extends ProductCardData {
  priority?: boolean;
  /** 'sm' = compact grid, 'lg' = featured slot */
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProductCard({
  slug,
  name,
  price,
  discount,
  image,
  gallery,
  rating,
  priority = false,
  size = "md",
  className,
}: ProductCardProps) {
  const [zoomOpen, setZoomOpen] = useState(false);

  const salePrice =
    discount && discount > 0 ? Math.round(price * (1 - discount / 100)) : null;

  const mainSrc =
    image?.startsWith("http") ?
      image
    : `https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80`;

  const hoverSrc =
    gallery?.[0]?.startsWith("http") ?
      gallery[0]
    : `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80`;

  const hasAlt = hoverSrc !== mainSrc;

  const aspectRatio =
    size === "lg" ? "aspect-[2/3]"
    : size === "sm" ? "aspect-[3/5]"
    : "aspect-[3/4]";

  return (
    <>
      <article
        className={cn(
          "group relative overflow-hidden rounded-xl bg-white",
          "ring-1 ring-stone-200 hover:ring-stone-300",
          "transition-shadow duration-300 hover:shadow-md",
          className,
        )}
        role="listitem"
      >
        {/* ── Image ─────────────────────────────────────────────── */}
        <div
          className={cn("relative overflow-hidden bg-stone-100", aspectRatio)}
        >
          {/* Primary */}
          <Image
            src={mainSrc}
            alt={name}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              hasAlt && "group-hover:opacity-0",
            )}
            sizes="(max-width:480px) 50vw,(max-width:768px) 40vw,(max-width:1280px) 25vw,20vw"
            priority={priority}
          />

          {/* Hover (gallery[0]) — pure CSS */}
          {hasAlt && (
            <Image
              src={hoverSrc}
              alt={`${name} alternate view`}
              fill
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              sizes="(max-width:480px) 50vw,(max-width:768px) 40vw,(max-width:1280px) 25vw,20vw"
            />
          )}

          {/* Discount badge */}
          {discount && discount > 0 && (
            <span
              className="absolute top-2 left-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white"
              aria-label={`${discount}% off`}
            >
              -{discount}%
            </span>
          )}

          {/* Quick-view button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setZoomOpen(true);
            }}
            aria-label={`Quick view — ${name}`}
            className={cn(
              "absolute top-2 right-2 z-10",
              "flex size-8 items-center justify-center rounded-full",
              "bg-white/95 text-stone-600 shadow-sm",
              "opacity-0 scale-75 transition-all duration-200",
              "group-hover:opacity-100 group-hover:scale-100",
              "hover:bg-white hover:text-green-600 active:scale-90",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
            )}
          >
            <Eye size={13} />
          </button>

          {/* Zara-style hover panel */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10",
              "translate-y-full transition-transform duration-300",
              "ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0",
              "bg-white/95 backdrop-blur-sm",
              "px-3.5 pt-3 pb-3.5 border-t border-stone-100",
            )}
            aria-hidden="true"
          >
            <p className="mb-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-stone-900">
              {name}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-green-600">
              View Details
              <svg className="size-2.5" fill="none" viewBox="0 0 10 10">
                <path
                  d="M2 5h6M5 2l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="space-y-1 px-3 py-2.5">
          <StarRating rating={rating} size={9} showValue />

          <div className="flex flex-wrap items-baseline gap-2">
            <span
              suppressHydrationWarning={true}
              className="text-[14px] font-bold tabular-nums text-stone-900 sm:text-[15px]"
            >
              EGP {salePrice ?? price}
            </span>
            {salePrice && (
              <span
                suppressHydrationWarning={true}
                className="text-[11px] tabular-nums text-stone-400 line-through"
              >
                EGP {price}
              </span>
            )}
          </div>
        </div>

        {/* Accessible link overlay */}
        <Link
          href={`/products/${slug}`}
          className="absolute inset-0 z-[5] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500"
          aria-label={`View ${name}`}
        />
      </article>

      {zoomOpen && (
        <ZoomOverlay
          image={mainSrc}
          name={name}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </>
  );
}
