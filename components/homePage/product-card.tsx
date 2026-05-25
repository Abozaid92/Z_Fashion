"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import dynamic from "next/dynamic";
import { Eye, Star } from "lucide-react";
import { cn } from "@/app/[locale]/_lib/utils";

// Dynamic import — zoom loads ONLY on click
const ZoomOverlay = dynamic(() => import("./zoom-overlay"), {
  ssr: false,
  loading: () => null,
});

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  discount?: number | null;
  image: string;
  gallery: string[];
  brand?: string | null;
  rating: number;
}

interface ProductCardProps extends ProductCardData {
  priority?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProductCard({
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
  const t: any = useTranslations();
  const [zoomOpen, setZoomOpen] = useState(false);

  const salePrice =
    discount && discount > 0 ? Math.round(price * (1 - discount / 100)) : null;

  // Use Unsplash placeholder if image is empty/local
  const mainSrc =
    image?.startsWith("http") ?
      image
    : `https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80`;
  const hoverSrc =
    gallery?.[0]?.startsWith("http") ?
      gallery[0]
    : `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80`;
  const hasAltImage = true;
  // const hasAltImage = hoverSrc !== mainSrc;

  const aspectRatio = size === "lg" ? "aspect-[2/3]" : "aspect-[3/4]";

  return (
    <>
      <article
        className={cn(
          "group relative overflow-hidden rounded-xl bg-white",
          "ring-1 ring-stone-100 hover:ring-stone-200",
          "transition-shadow duration-300 hover:shadow-md",
          className,
        )}
        role="listitem"
      >
        {/* ── Image area ────────────────────────────────────── */}
        <div className={`relative ${aspectRatio} overflow-hidden bg-stone-100`}>
          {/* Primary image */}
          <Image
            src={mainSrc}
            alt={name}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              hasAltImage && "group-hover:opacity-0",
            )}
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 40vw, (max-width: 1280px) 25vw, 20vw"
            priority={priority}
            quality={100}
          />

          {/* Hover image (gallery[0]) — CSS only */}
          {hasAltImage && (
            <Image
              src={hoverSrc}
              alt={`${name} alternate view`}
              fill
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 40vw, (max-width: 1280px) 25vw, 20vw"
              quality={100}
            />
          )}

          {/* Discount badge */}
          {discount && discount > 0 && (
            <span
              className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full"
              aria-label={t("ProductCard.discount_off", {
                discount: String(discount),
              })}
            >
              -{discount}%
            </span>
          )}

          {/* Eye / Zoom button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setZoomOpen(true);
            }}
            aria-label={t("ProductCard.quick_view", { name })}
            className={cn(
              "absolute top-2 right-2 z-10",
              "flex size-8 items-center justify-center rounded-full",
              "bg-white/95 text-stone-600 shadow-sm",
              "opacity-0 scale-75 transition-all duration-200",
              "group-hover:opacity-100 group-hover:scale-100",
              "hover:bg-white hover:text-lime-600 active:scale-90",
            )}
          >
            <Eye size={13} />
          </button>

          {/* Zara-style hover panel — CSS translate only */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10",
              "translate-y-full transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
              "group-hover:translate-y-0",
              "bg-white/95 backdrop-blur-sm",
              "px-3.5 pt-3 pb-3.5 border-t border-stone-100",
            )}
            aria-hidden="true"
          >
            <p className="text-stone-900 text-[13px] font-semibold leading-snug mb-2 line-clamp-2">
              {name}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-lime-600 uppercase tracking-wide">
              {t("ProductCard.view_details")}
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 10 10">
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

        {/* ── Card footer ───────────────────────────────────── */}
        <div className="px-3 py-2.5 space-y-1">
          {/* Stars */}
          <div
            className="flex items-center gap-0.5"
            role="img"
            aria-label={`${rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={9}
                className={cn(
                  i < Math.round(rating) ?
                    "fill-amber-400 text-amber-400"
                  : "fill-stone-200 text-stone-200",
                )}
              />
            ))}
            <span className="ml-1 text-[10px] text-stone-400 tabular-nums">
              {rating}
            </span>
          </div>
          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              suppressHydrationWarning={true} // دي أهم حاجة في المجرة دلوقتي
              className="text-[14px] sm:text-[15px] font-bold text-stone-900 tabular-nums"
            >
              £{salePrice ?? price}
            </span>
            {salePrice && (
              <span
                suppressHydrationWarning={true}
                className="text-[11px] text-stone-400 line-through tabular-nums"
              >
                £{price}
              </span>
            )}
          </div>
        </div>

        {/* Accessible link overlay */}
        <Link
          href={`/products/${slug}`}
          className="absolute inset-0 z-[5] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-inset rounded-xl"
          aria-label={t("ProductCard.view", { name })}
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
