import { Suspense } from "react";
import type { Metadata } from "next";

import redisClient from "@/lib/redisClient";

import { showcaseKeys } from "@/hooks/use-showcase";

import { HeroSection } from "@/components/homePage/hero-section";
// import { CollectionsSlider } from "@/components/homePage/collections-slider";
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

// ── Redis ────────────────────────────────────────────────────
try {
  redisClient
    .incr("stats:homepage")
    .catch((err: any) => console.error("Redis Incr Error:", err));
  //  state will show to user (never reset)
} catch (e) {
  console.error("Redis Connection Error:", e);
}

// ── ISR ────────────────────────────────────────────────────
export const revalidate = 86400;

// ── SEO Metadata ────────────────────────────────────────────
export const metadata: Metadata = {
  title:
    "ZFashin - Premium Fashion & Outdoor Apparel for Men, Women & Kids | Shop Buck Commander® Collections",
  description:
    "Discover ZFashin's premium fashion collections featuring Buck Commander®, Tough As Buck, and legendary outdoor apparel. Shop high-quality clothing for men, women, and kids with fast shipping. Free returns on all orders. Trusted by over 100,000+ customers worldwide.",
  keywords: [
    "ZFashin",
    "fashion clothing",
    "men's fashion",
    "women's fashion",
    "kids clothing",
    "fashion store",
    "online shopping",
    "fashion brands",
  ],

  category: "Fashion & Apparel",
  classification: "E-Commerce",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#ffffff",
  },
};

// ── Skeletons ──────────────────────────────────────────────
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

// ── Page ───────────────────────────────────────────────────
import ServerIntl from "@/lib/server-intl";
import getQueryClient from "@/lib/getQueryClient";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
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

  const [q1, q2, q3] = await Promise.all([
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
    // await redisClient.get("stats:total:homepage"),
    // await prisma.user.count(),
    // await prisma.product.count(),
    // await prisma.comment.count(),
  ]);

  // ── Structured Data (JSON-LD) ────────────────────────────
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.zfashin.com/#website",
        url: "https://www.zfashin.com",
        name: "ZFashin",
        description:
          "Premium fashion and outdoor apparel for men, women, and kids. Shop Buck Commander®, Tough As Buck collections.",
        publisher: {
          "@id": `${DOMAIN}//#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://www.zfashin.com/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${DOMAIN}/#webpage`,
        url: `${DOMAIN}`,
        name: "ZFashin - Premium Fashion & Outdoor Apparel Collections",
        description:
          "Shop Buck Commander®, Tough As Buck, and legendary outdoor collections for men, women, and kids. Premium quality with free shipping and returns.",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${DOMAIN}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${DOMAIN}`,
          },
        ],
      },
      {
        "@type": "Store",
        "@id": `${DOMAIN}/#store`,
        name: "ZFashin Online Store",
        // image: "https://www.zfashin.com/store-image.jpg",
        description:
          "Premium online fashion store offering Buck Commander®, Tough As Buck, and outdoor apparel collections.",
        // priceRange: "$$",
        // currenciesAccepted: "USD, EUR, GBP, EG",
        paymentAccepted: "Credit Card, PayPal, Apple Pay, Google Pay",
        openingHours: "Mo-Su 00:00-24:00",
        url: "https://www.zfashin.com",
      },
      {
        "@type": "ItemList",
        "@id": `${DOMAIN}/products/#itemlist`,
        name: "Featured Products",
        description: "Curated selection of our most popular fashion items",
        numberOfItems: 50,
      },
      {
        "@type": "AggregateRating",
        "@id": "https://www.zfashin.com/#aggregaterating",
        ratingValue: "4.8",
        reviewCount: "12847",
        bestRating: "5",
        worstRating: "1",
      },
    ],
  };

  return (
    <ServerIntl namespaces={namespaces} params={params}>
      {/* Structured Data Injection */}
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
        <HeroSection
        // stats={{ totalVisits, totalUsers, totalProducts, totalComments }}
        />{" "}
        {/* <CollectionsSlider /> */}
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
