"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useEffect, useState, useMemo } from "react";
import {
  ArrowUpRight,
  ShoppingBag,
  Truck,
  Shield,
  Star,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { showcaseKeys } from "@/hooks/use-showcase";
import { DOMAIN } from "@/lib/constants";
// interface HeroProps {
//   stats: {
//     totalVisits: number | string;
//     totalUsers: number;
//     totalProducts: number;
//     totalComments: number;
//   };
// }

/** * Optimized CountUp Hook
 */
function useCountUp(target: number, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setVal(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);
  return val;
}

const IMAGES = [
  {
    src: "https://res.cloudinary.com/dfhecwiib/image/upload/v1778315261/Gemini_Generated_Image_ni3hjmni3hjmni3h_wbnav1.png",
    tag: "جديدنا",
    price: "£89",
    name: "Urban Shopper",
  },
  {
    src: "https://res.cloudinary.com/dfhecwiib/image/upload/v1775975138/pexels-photo-6349069_q5h6gs.webp",
    tag: "الأكثر طلباً",
    price: "£64",
    name: "Street Essential",
  },
  {
    src: "https://res.cloudinary.com/dfhecwiib/image/upload/v1775975260/pexels-elena-kravets-1601294419-34150926_woqgi2.jpg",
    tag: "إصدار محدود",
    price: "£129",
    name: "Premium Edition",
  },
];

export const getMainStats = async () => {
  const res = await fetch(`${DOMAIN}/api/summary/mainStats`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    // console.log("failed response getMainStatus", res);
    return;
  }
  const body = await res.json();
  return body;
};

export function HeroSection() {
  const { data, isLoading } = useQuery({
    queryKey: showcaseKeys.mainStats(),
    queryFn: getMainStats,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const t = useTranslations("HeroSectionHome" as any);
  const [active, setActive] = useState(0);

  // Get product images with translations
  const productImages = useMemo(
    () =>
      t.raw("product_images") as Array<{
        tag: string;
        name: string;
        price: string;
      }>,
    [t],
  );

  // Get marquee items with translations
  const marqueeItems = useMemo(
    () =>
      t.raw("marquee_items") as Array<{
        text: string;
      }>,
    [t],
  );

  // Formatting utility
  const fmt = (n: number) => {
    if (isNaN(Number(n))) return "...";
    return n;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#f8faf9] text-zinc-900 selection:bg-emerald-200">
      {/* ── Top Announcement ── */}
      <div className="bg-emerald-600 py-2.5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 text-xs font-bold tracking-widest uppercase">
          <Sparkles size={14} className="animate-pulse" />
          <span>{t("announcement")}</span>
          <ArrowUpRight size={14} />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:py-20">
        {/* LEFT CONTENT */}

        <div className="flex flex-col gap-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
            <Sparkles size={12} className="text-emerald-600" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">
              {t("collection_badge")}
            </span>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <h1 className="text-5xl font-black leading-[0.9] tracking-tighter sm:text-7xl lg:text-8xl">
              {t("main_title_1")} <br />
              <span className="italic text-emerald-600 font-serif lowercase">
                {t("main_title_2")}
              </span>{" "}
              <br />
              {t("main_title_3")}
            </h1>
          </div>

          <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-md text-lg leading-relaxed text-zinc-500">
            {t("description", { users: fmt(+data?.totalUsers) })}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="group flex items-center gap-3 rounded-full bg-zinc-900 px-8 py-4 text-xs font-bold tracking-widest text-white transition-all hover:bg-emerald-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20"
            >
              <ShoppingBag size={18} />
              {t("shop_button")}
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
            <Link
              href="/lookbook"
              className="rounded-full border border-zinc-200 bg-white px-8 py-4 text-xs font-bold tracking-widest text-zinc-600 transition-all hover:border-emerald-500 hover:text-emerald-600"
            >
              {t("lookbook_button")}
            </Link>
          </div>

          {isLoading ?
            [1, 2, 3, 4].map((stat) => (
              <div
                key={stat}
                className="group rounded-2xl border border-zinc-100 bg-white p-5 transition-all hover:-translate-y-1 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="text-2xl font-black tracking-tight text-gray-400 animate-pulse transition-colors"></div>
                <div className="text-2xl font-black tracking-tight text-gray-400 animate-pulse transition-colors"></div>
                <div className="text-2xl font-black tracking-tight text-gray-400 animate-pulse transition-colors"></div>
              </div>
            ))
          : <div className="grid grid-cols-2 gap-4 max-w-md">
              {[
                {
                  val: `${fmt(+data.totalUsers)}+`,
                  lbl: t("stat_1_value"),
                  sub: t("stat_1_sub"),
                },
                {
                  val: `${fmt(+data.totalComments)}+`,
                  lbl: t("stat_2_value"),
                  sub: t("stat_2_sub"),
                },
                {
                  val: `${fmt(+data.totalProducts)}+`,
                  lbl: t("stat_3_value"),
                  sub: t("stat_3_sub"),
                },
                {
                  val: `${fmt(+data.totalVisits)}+`,
                  lbl: t("stat_4_value"),
                  sub: t("stat_4_sub"),
                },
              ].map((stat, i) => (
                <div
                  key={stat.lbl}
                  className="group rounded-2xl border border-zinc-100 bg-white p-5 transition-all hover:-translate-y-1 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  <div className="text-2xl font-black tracking-tight text-zinc-900 group-hover:text-emerald-600 transition-colors">
                    {stat.val}
                  </div>
                  <div className="text-xs font-bold text-zinc-800">
                    {stat.lbl}
                  </div>
                  <div className="text-[10px] text-zinc-400">{stat.sub}</div>
                </div>
              ))}
            </div>
          }
          {/* Stats Grid */}
        </div>

        {/* RIGHT IMAGE SECTION */}
        <div className="relative h-[500px] w-full lg:h-[650px]">
          {/* Main Showcase */}
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] border-8 border-white bg-zinc-100 shadow-2xl shadow-emerald-900/10">
            {IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  i === active ? "scale-100 opacity-100" : "scale-110 opacity-0"
                }`}
              >
                <Image
                  quality={100}
                  src={img.src}
                  alt={productImages[i]?.name || img.name}
                  fill
                  priority={i === 0}
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent" />
              </div>
            ))}

            {/* Overlay Info */}
            <div className="absolute top-6 left-6 rounded-lg bg-lime-400 px-4 py-1.5 text-[10px] font-black tracking-widest text-emerald-950 uppercase">
              {productImages[active]?.tag || IMAGES[active].tag}
            </div>

            <div className="absolute bottom-8 left-8 flex items-end gap-2 text-white">
              <span className="text-5xl font-black tracking-tighter">
                {productImages[active]?.price || IMAGES[active].price}
              </span>
              <span className="mb-2 text-[10px] font-medium opacity-80 uppercase tracking-widest">
                {t("price_label")}
              </span>
            </div>

            {/* Dots */}
            <div className="absolute bottom-8 right-8 flex gap-2">
              {IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 transition-all duration-500 ${
                    i === active ? "w-8 bg-white" : (
                      "w-2 bg-white/40 hover:bg-white/60"
                    )
                  } rounded-full`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails Column */}
          <div className="absolute right-0 top-0 flex h-full w-[30%] flex-col gap-4">
            {IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative flex-1 overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                  i === active ?
                    "border-emerald-500 scale-105 shadow-xl shadow-emerald-500/20"
                  : "border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                }`}
              >
                <Image
                  quality={100}
                  src={img.src}
                  alt={productImages[i]?.name || img.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 rounded bg-white px-2 py-0.5 text-[9px] font-black text-emerald-600">
                  {productImages[i]?.price || img.price}
                </div>
              </button>
            ))}
          </div>

          {/* Floating Verified Badge */}
          <div className="absolute -bottom-6 right-[20%] animate-bounce duration-[3000ms] rounded-2xl border border-emerald-100 bg-white p-4 shadow-xl shadow-emerald-900/10 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-black text-emerald-900">
                S
              </div>
              <div>
                <div className="flex gap-0.5 text-emerald-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill="currentColor" />
                  ))}
                </div>
                <p className="text-[10px] font-bold text-zinc-900 leading-tight">
                  "{t("testimonial_quote")}"
                </p>
                <p className="text-[9px] text-zinc-400">
                  {t("testimonial_author")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Infinite Marquee ── */}
      <div className="border-y border-zinc-100 bg-white py-6 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, rep) => (
            <div key={rep} className="flex gap-12 px-6 items-center">
              {[
                { icon: Truck, item: marqueeItems[0]?.text || "Fast Delivery" },
                {
                  icon: Shield,
                  item: marqueeItems[1]?.text || "Secure Payment",
                },
                {
                  icon: Star,
                  item: marqueeItems[2]?.text || "Premium Quality",
                },
                {
                  icon: Sparkles,
                  item: marqueeItems[3]?.text || "Weekly Drops",
                },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <feature.icon size={16} className="text-emerald-500" />
                  <span className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase">
                    {feature.item}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
