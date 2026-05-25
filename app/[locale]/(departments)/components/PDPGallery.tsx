"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { cn } from "../../_lib/utils";

// Lazy-load zoom overlay — loaded only on first user interaction
const ZoomOverlay = dynamic(() => import("./ZoomOverlay"), {
  ssr: false,
  loading: () => null,
});

interface PDPGalleryProps {
  images: string[];
  productName: string;
}

export default function PDPGallery({ images, productName }: PDPGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const t: any = useTranslations();

  const safeImages =
    images.length > 0 ?
      images
    : [
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&q=80",
      ];

  return (
    <>
      <div className="flex gap-3">
        {/* ── Vertical thumbnails (desktop only) ───────────────── */}
        <div
          className="hidden w-[68px] shrink-0 flex-col gap-2 lg:flex"
          role="list"
          aria-label={t("PDPGallery.aria.product_images")}
        >
          {safeImages.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              role="listitem"
              aria-label={t("PDPGallery.aria.view_image", {
                index: String(i + 1),
              })}
              aria-pressed={active === i}
              className={cn(
                "relative aspect-[3/4] w-full overflow-hidden rounded-lg border-2 transition-colors",
                active === i ? "border-stone-900" : (
                  "border-stone-200 hover:border-stone-400"
                ),
              )}
            >
              <Image
                quality={100}
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="68px"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* ── Main image ────────────────────────────────────────── */}
        <div className="flex-1">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label={t("PDPGallery.aria.zoom_image")}
            className="relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            style={{ aspectRatio: "3/4" }}
          >
            <Image
              quality={100}
              src={safeImages[active]}
              alt={productName}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width:768px) 100vw,(max-width:1280px) 55vw,480px"
              priority
            />
          </button>

          {/* Mobile thumbnails strip */}
          <div
            className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {safeImages.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                aria-pressed={active === i}
                className={cn(
                  "relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                  active === i ? "border-stone-900" : (
                    "border-stone-200 hover:border-stone-400"
                  ),
                )}
              >
                <Image
                  quality={100}
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lazy-loaded zoom modal */}
      {zoomOpen && (
        <ZoomOverlay
          image={safeImages[active]}
          name={productName}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </>
  );
}
