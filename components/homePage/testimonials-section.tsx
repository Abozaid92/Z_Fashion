"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { useShowcaseComments } from "@/hooks/use-showcase";
import type { ShowcaseComment } from "@/hooks/use-showcase";
import { useMemo } from "react";

const FALLBACK: ShowcaseComment[] = [
  {
    id: "1",
    content:
      "Best outdoor jacket I've ever owned. The quality is unmatched — three hunting seasons and it still looks new.",
    rating: 5,
    user: { name: "Marcus T.", image: null },
  },
  {
    id: "2",
    content:
      "The flannel shirts are incredibly soft yet durable. Finally, apparel that actually holds up in the field.",
    rating: 5,
    user: { name: "Sarah K.", image: null },
  },
  {
    id: "3",
    content:
      "Ordered for the whole family. Everyone loves their gear. Fast shipping, premium packaging.",
    rating: 5,
    user: { name: "James R.", image: null },
  },
  {
    id: "4",
    content:
      "Been a loyal customer for years. The Buck Commander line never disappoints. Highly recommended.",
    rating: 5,
    user: { name: "Carla M.", image: null },
  },
  {
    id: "5",
    content:
      "The fit is perfect, the materials feel premium, and the style is exactly what I was looking for.",
    rating: 5,
    user: { name: "David H.", image: null },
  },
  {
    id: "6",
    content:
      "Excellent customer service and even better products. Will be buying again soon.",
    rating: 5,
    user: { name: "Robert L.", image: null },
  },
  {
    id: "7",
    content:
      "The attention to detail in the stitching and fabric is obvious. Top tier gear.",
    rating: 5,
    user: { name: "Emma S.", image: null },
  },
  {
    id: "8",
    content: "Fast delivery and the product exceeded my expectations. 5 stars!",
    rating: 5,
    user: { name: "John D.", image: null },
  },
  {
    id: "9",
    content: "Great for cold mornings. Keeps me warm without being too bulky.",
    rating: 5,
    user: { name: "Mike P.", image: null },
  },
  {
    id: "10",
    content:
      "Finally a brand that understands what hunters actually need. Durable and quiet.",
    rating: 5,
    user: { name: "Steve W.", image: null },
  },
];

export function TestimonialsSection() {
  const t = useTranslations("TestimonialsSection" as any);
  const { data: fetched = [] } = useShowcaseComments();

  // تأكد من وجود 10 تعليقات (من الداتابيز أو الفالباك)
  const allComments = fetched.length >= 10 ? fetched : FALLBACK;

  // تقسيم التعليقات لسطرين (5 فوق و 5 تحت)
  const topRow = useMemo(() => allComments.slice(0, 5), [allComments]);
  const bottomRow = useMemo(() => allComments.slice(5, 10), [allComments]);

  // تكرار السطر الأول للموبايل (الحركة اليدوية)
  const topTrack = useMemo(() => [...topRow, ...topRow, ...topRow], [topRow]);

  return (
    <section
      className="py-14 sm:py-20 bg-stone-50 overflow-hidden"
      aria-label="Customer testimonials"
    >
      {/* Header */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
          <div>
            <p className="text-lime-600 text-[11px] font-bold tracking-[0.2em] uppercase mb-1.5">
              {t("verified_buyer")}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 leading-tight">
              {t("testimonials")}
            </h2>
          </div>
          {/* Rating summary */}
          <div className="flex items-center gap-3 sm:pb-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <div>
              <p className="text-stone-900 text-xl font-black font-display leading-none">
                {t("rating")}
              </p>
              <p className="text-stone-400 text-[11px] mt-0.5">
                {t("reviews")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1 — سحب يدوي في الموبايل والكمبيوتر */}
      <div className="relative">
        {/* Fade Edges */}
        <div className="pointer-events-none absolute left-0 inset-y-0 w-12 z-10 bg-gradient-to-r from-stone-50 to-transparent" />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-12 z-10 bg-gradient-to-l from-stone-50 to-transparent" />

        <div
          className="
            flex gap-4 px-4
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
            overflow-x-auto 
            scrollbar-none snap-x snap-mandatory
            lg:justify-start lg:px-10
          "
          role="list"
        >
          {/* في الموبايل نعرض الـ Track المكرر، وفي الكمبيوتر نعرض الـ 5 فقط ولكن قابلة للسحب */}
          <div className="flex gap-4 lg:hidden">
            {topTrack.map((c, i) => (
              <div key={`mobile-a-${c.id}-${i}`} className="snap-start">
                <TestCard comment={c} />
              </div>
            ))}
          </div>

          <div className="hidden lg:flex gap-4">
            {topRow.map((c) => (
              <TestCard key={`desktop-a-${c.id}`} comment={c} />
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 — كما هو (أنيميشن في الموبايل وسحب في الكمبيوتر) */}
      <div className="relative mt-4">
        <div className="pointer-events-none absolute left-0 inset-y-0 w-12 z-10 bg-gradient-to-r from-stone-50 to-transparent" />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-12 z-10 bg-gradient-to-l from-stone-50 to-transparent" />

        <div
          className="
            flex gap-4 w-max lg:w-full
            animate-marquee-r lg:animate-none 
            hover:[animation-play-state:paused]
            lg:overflow-x-auto lg:justify-start lg:px-10
            scrollbar-none [&::-webkit-scrollbar]:hidden
          "
          role="list"
          aria-hidden="true"
        >
          {/* سحب السطر الثاني: في الموبايل يظل أنيميشن وفي الكمبيوتر متاح للسحب */}
          <div className="flex gap-4 lg:hidden">
            {[...bottomRow, ...bottomRow].map((c, i) => (
              <TestCard key={`b-anim-${c.id}-${i}`} comment={c} muted />
            ))}
          </div>

          <div className="hidden lg:flex gap-4">
            {bottomRow.map((c) => (
              <TestCard key={`desktop-b-${c.id}`} comment={c} muted />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestCard({
  comment,
  muted = false,
}: {
  comment: ShowcaseComment;
  muted?: boolean;
}) {
  const initials = comment.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <article
      className={`shrink-0 w-[280px] sm:w-[340px] rounded-2xl border p-4 sm:p-5 space-y-3.5 ${
        muted ?
          "border-stone-100 bg-white/60 opacity-50"
        : "border-stone-200 bg-white shadow-sm"
      }`}
      role="listitem"
    >
      <div className="flex items-start justify-between">
        <Quote size={18} className="text-lime-500 shrink-0" />
        <div className="flex gap-0.5" aria-label={`${comment.rating} stars`}>
          {Array.from({ length: comment.rating }).map((_, i) => (
            <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>

      <p className="text-stone-600 text-[13px] leading-relaxed line-clamp-3">
        &ldquo;{comment.content}&rdquo;
      </p>

      <div className="flex items-center gap-2.5 pt-2 border-t border-stone-100">
        {comment.user.image ?
          <div className="relative size-8 rounded-full overflow-hidden bg-stone-200 shrink-0">
            <Image
              quality={10}
              src={comment.user.image}
              alt={comment.user.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        : <div className="size-8 rounded-full bg-lime-100 border border-lime-200 flex items-center justify-center shrink-0">
            <span className="text-lime-700 text-[11px] font-bold">
              {initials}
            </span>
          </div>
        }
        <div>
          <p className="text-stone-900 text-[12px] font-semibold">
            {comment.user.name}
          </p>
          <p className="text-stone-400 text-[10px] flex items-center gap-1">
            <span className="text-lime-500">✓</span> Verified purchase
          </p>
        </div>
      </div>
    </article>
  );
}
