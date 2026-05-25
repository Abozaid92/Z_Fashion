"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, type ProductCardData } from "./product-card";

interface CarouselProps {
  products: ProductCardData[]; // الإجباري الوحيد
  fromBg?: string; // اختياري: عشان تظبط التلاشي (Fade) حسب لون الخلفية
  ariaLabel?: string; // اختياري: عشان الـ Accessibility
}

export function Carousel({
  products,
  fromBg = "from-white",
  ariaLabel = "Products",
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);
  const [isPaused, setIsPaused] = useState(false);

  // Speed in px per frame (~60 fps)
  const SPEED = 0.55;

  // We triple the list so the loop never shows a gap
  // console.log(products);
  const tripled = [...products, ...products, ...products];

  const animate = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    if (!pausedRef.current) {
      offsetRef.current += SPEED;

      const halfWidth = el.scrollWidth / 3;
      if (offsetRef.current >= halfWidth) {
        offsetRef.current -= halfWidth;
      }

      el.style.transform = `translateX(-${offsetRef.current}px)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  const pause = () => {
    pausedRef.current = true;
    setIsPaused(true);
  };

  const resume = () => {
    pausedRef.current = false;
    setIsPaused(false);
  };

  const nudge = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 3;
    offsetRef.current = Math.max(
      0,
      Math.min(
        offsetRef.current + (dir === "right" ? 260 : -260),
        halfWidth - 1,
      ),
    );
    el.style.transform = `translateX(-${offsetRef.current}px)`;
  };

  // لو مفيش منتجات، مفيش داعي نرندر حاجة
  if (!products?.length) return null;

  return (
    <div
      className="relative group/carousel w-full"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {/* Pause indicator pill */}
      <div
        className={`
          absolute top-3 left-1/2 -translate-x-1/2 z-20
          flex items-center gap-1.5 px-3 py-1 rounded-full
          bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide
          pointer-events-none select-none
          transition-all duration-300
          ${isPaused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
        `}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
        Paused
      </div>

      {/* Arrow — Left */}
      <button
        onClick={() => nudge("left")}
        className="
          absolute left-4 top-1/2 -translate-y-1/2 z-10
          w-10 h-10 flex items-center justify-center
          bg-white/90 shadow-md border border-stone-200 rounded-full
          text-stone-700 hover:text-lime-600 hover:border-lime-500
          opacity-0 group-hover/carousel:opacity-100
          transition-all duration-200 hidden sm:flex
        "
        aria-label="Scroll left"
        onMouseEnter={pause}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Arrow — Right */}
      <button
        onClick={() => nudge("right")}
        className="
          absolute right-4 top-1/2 -translate-y-1/2 z-10
          w-10 h-10 flex items-center justify-center
          bg-white/90 shadow-md border border-stone-200 rounded-full
          text-stone-700 hover:text-lime-600 hover:border-lime-500
          opacity-0 group-hover/carousel:opacity-100
          transition-all duration-200 hidden sm:flex
        "
        aria-label="Scroll right"
        onMouseEnter={pause}
      >
        <ChevronRight size={20} />
      </button>

      {/* Fade — Left edge */}
      <div
        className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-24 z-10 bg-gradient-to-r ${fromBg} to-transparent`}
        aria-hidden="true"
      />

      {/* Fade — Right edge */}
      <div
        className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-24 z-10 bg-gradient-to-l ${fromBg} to-transparent`}
        aria-hidden="true"
      />

      {/* ── Track (will-change for GPU compositing) ───────── */}
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-3 sm:gap-4 will-change-transform"
          style={{ width: "max-content" }}
          role="list"
          aria-label={`${ariaLabel} list`}
        >
          {tripled.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="shrink-0 w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[260px]"
              role="listitem"
            >
              <ProductCard {...p} priority={i < 4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
