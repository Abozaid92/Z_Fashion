// app/[locale]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";

import redisClient from "@/lib/redisClient";
import { showcaseKeys } from "@/hooks/use-showcase";

import { HeroSection } from "@/components/homePage/hero-section";
import { CategoryGrid } from "@/components/homePage/category-grid";
import { ShowcaseSection } from "@/components/homePage/showcase-section";
import { TestimonialsSection } from "@/components/homePage/testimonials-section";
import { BrandsSection } from "@/components/homePage/brands-section";
import {
  getCtgImage,
  getHomepageShowcaseComments,
  getHomepageShowcaseProducts,
} from "./(departments)/(main-layouts)/clothes/api";
import { staleTime, gcTime, DOMAIN } from "@/lib/constants";
import ServerIntl from "@/lib/server-intl";
import getQueryClient from "@/lib/getQueryClient";

// ── Redis (مراقبة الزيارات في الـ Production) ────────────────
if (process.env.NEXT_PHASE !== "phase-production-build") {
  try {
    redisClient
      .incr("stats:homepage")
      .catch((err: any) => console.error("Redis Incr Error:", err));
  } catch (e) {
    console.error("Redis Connection Error:", e);
  }
}

// ── قاموس الميتادات والترجمات للـ 8 لغات ──────────────────────
const contentTranslations: Record<
  string,
  { title: string; desc: string; homeBtn: string }
> = {
  en: {
    title: "ZFashin - Premium Fashion & Outdoor Apparel",
    desc: "Discover premium fashion collections with fast shipping worldwide.",
    homeBtn: "Home",
  },
  ar: {
    title: "زد فاشن - منصة أزياء عالمية فاخرة",
    desc: "اكتشف تشكيلات الأزياء الراقية والملابس العصرية مع شحن سريع لكل العالم.",
    homeBtn: "الرئيسية",
  },
  de: {
    title: "ZFashin - Premium-Mode & Outdoor-Bekleidung",
    desc: "Entdecken Sie Premium-Modekollektionen mit schnellem weltweiten Versand.",
    homeBtn: "Startseite",
  },
  hi: {
    title: "ZFashin - प्रीमियम फैशन और आउटडोर परिधान",
    desc: "दुनिया भर में तेज़ शिपिंग के साथ प्रीमियम फैशन संग्रह खोजें।",
    homeBtn: "होम",
  },
  zh: {
    title: "ZFashin - 高端时尚与户外服饰",
    desc: "探索高端时尚系列，全球快速发货。",
    homeBtn: "首页",
  },
  ru: {
    title: "ZFashin - Премиальная мода и одежда для отдыха",
    desc: "Откройте для себя коллекции премиальной моды с быстрой доставкой по всему миру.",
    homeBtn: "Главная",
  },
  fr: {
    title: "ZFashin - Mode Haut de Gamme & Vêtements Outdoor",
    desc: "Découvrez des collections de mode haut de gamme avec une livraison rapide dans le monde entier.",
    homeBtn: "Accueil",
  },
  es: {
    title: "ZFashin - Moda Premium y Ropa Outdoor",
    desc: "Descubre colecciones de moda premium con envío rápido a todo el mundo.",
    homeBtn: "Inicio",
  },
};

// ── توليد الميتادات ديناميكياً للـ 8 لغات (SEO) ────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const translation = contentTranslations[locale] || contentTranslations.en;

  return {
    title: `${translation.title} | Shop Buck Commander®`,
    description: `${translation.desc} Trusted by over 100,000+ customers worldwide. Free returns on all orders.`,
    metadataBase: new URL(DOMAIN || "http://localhost:3000"),
    keywords: [
      "ZFashin",
      "fashion store",
      "online shopping",
      "premium apparel",
    ],
    category: "Fashion & Apparel",
    classification: "E-Commerce",
    twitter: {
      card: "summary",
      title: translation.title,
      description: translation.desc,
      images: ["/logo.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "theme-color": "#ffffff",
    },
  };
}

// ── Skeletons (مؤشرات التحميل المستقرة) ────────────────────────
function ShowcaseSkeleton() {
  return (
    <section className="py-16 bg-white" aria-hidden="true">
      <div className="max-w-screen-xl mx-auto px-4 space-y-14">
        {[1, 2].map((s) => (
          <div key={s}>
            <div className="h-8 w-48 bg-stone-100 rounded-lg animate-pulse mb-6" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="shrink-0 w-48">
                  <div className="aspect-[3/4] bg-stone-100 rounded-2xl animate-pulse" />
                  <div className="mt-2 h-3 bg-stone-100 rounded animate-pulse w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSkeleton() {
  return (
    <section className="py-16 bg-stone-50 overflow-hidden" aria-hidden="true">
      <div className="flex gap-5 px-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="shrink-0 w-80 h-44 bg-stone-100 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

// ── Component الصفحة الرئيسية ──────────────────────────────
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // فك الـ Promise الخاص باللغة هنا
  const translation = contentTranslations[locale] || contentTranslations.en;
  const currentLocalizedUrl = `${DOMAIN}/${locale}`;

  const namespaces = [
    "HeroSectionHome",
    "CollectionsSlider",
    "CategoryGrid",
    "ShowcaseSection",
    "TestimonialsSection",
    "HorizontalProductScroll",
    "BrandsSection",
    "Footer",
  ];
  const queryClient = getQueryClient();

  // 🚀 حماية الـ Prefetch أثناء الـ Build
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: showcaseKeys.products(),
        queryFn: getHomepageShowcaseProducts,
      }),
      queryClient.prefetchQuery({
        queryKey: showcaseKeys.comments(),
        queryFn: getHomepageShowcaseComments,
      }),
      queryClient.prefetchQuery({
        queryKey: showcaseKeys.ctgImag(),
        queryFn: getCtgImage,
      }),
    ]);
  }

  // ── الـ JSON-LD الديناميكي المتكامل والخالي من الأخطاء ─────────
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${DOMAIN}/#organization`,
        name: "ZFashin",
        url: DOMAIN,
        logo: `${DOMAIN}/logo.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${DOMAIN}/#website`,
        url: DOMAIN,
        name: "ZFashin",
        publisher: {
          "@id": `${DOMAIN}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${currentLocalizedUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${currentLocalizedUrl}/#webpage`,
        url: currentLocalizedUrl,
        name: translation.title,
        description: translation.desc,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${currentLocalizedUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: translation.homeBtn,
            item: currentLocalizedUrl,
          },
        ],
      },
      {
        "@type": "Store",
        "@id": `${DOMAIN}/#store`,
        name: "ZFashin Online Store",
        description: translation.desc,
        paymentAccepted: "Credit Card, PayPal, Apple Pay, Google Pay",
        openingHours: "Mo-Su 00:00-24:00",
        url: currentLocalizedUrl,
      },
      {
        "@type": "ItemList",
        "@id": `${currentLocalizedUrl}/products/#itemlist`,
        name: "Featured Products",
        description: "Curated selection of our most popular fashion items",
        numberOfItems: 50,
      },
      {
        "@type": "AggregateRating",
        "@id": `${DOMAIN}/#aggregaterating`,
        ratingValue: "4.8",
        reviewCount: "12847",
        bestRating: "5",
        worstRating: "1",
      },
    ],
  };

  return (
    <ServerIntl namespaces={namespaces} params={params}>
      {/* حقن سكريبت الـ Schema الاحترافي */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        key="structured-data"
      />

      <main
        className="min-h-screen bg-white overflow-x-hidden font-body"
        itemScope
        itemType="https://schema.org/WebPage"
      >
        <HeroSection />

        <Suspense fallback={<ShowcaseSkeleton />}>
          <CategoryGrid />
        </Suspense>

        <Suspense fallback={<ShowcaseSkeleton />}>
          <ShowcaseSection />
        </Suspense>

        <Suspense fallback={<TestimonialsSkeleton />}>
          <TestimonialsSection />
        </Suspense>

        <BrandsSection />
      </main>
    </ServerIntl>
  );
}
