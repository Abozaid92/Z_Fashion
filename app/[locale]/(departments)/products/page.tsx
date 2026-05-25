// app/[locale]/products/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import PLPClient from "../components/PLPClient";
import { searchParamsCache } from "../../utils/products/searchParams";
import redisClient from "@/lib/redisClient";
import { DOMAIN } from "@/lib/constants";
import ServerIntl from "@/lib/server-intl";
import getQueryClient from "@/lib/getQueryClient";

// ─── HELPER: FETCH PRODUCTS (Shared for Metadata & Page) ──────────────
async function fetchProductsData(params: URLSearchParams) {
  const res = await fetch(`${DOMAIN}/api/products?${params.toString()}`, {
    next: { revalidate: 86400, tags: ["products"] }, // ISR: 24 hours
  });
  if (!res.ok) return null;
  return res.json();
}

// ─── DYNAMIC METADATA (SEO Powerhouse) ────────────────────────────────
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const parsed = await searchParamsCache.parse(await searchParams);

  // تخصيص العنوان بناءً على القسم أو البحث
  const categoryTitle =
    parsed.cat ?
      `${parsed.cat.charAt(0).toUpperCase() + parsed.cat.slice(1)}`
    : "All Collections";
  const searchQuery = parsed.q ? `Search results for "${parsed.q}"` : "";
  const finalTitle = searchQuery || `${categoryTitle} | ZFashion Store`;

  return {
    title: finalTitle,

    description: `Browse the best ${categoryTitle} at ZFashion. High quality, premium materials, and fast global shipping.`,
    alternates: {
      canonical:
        parsed.cat ?
          `${DOMAIN}/products?cat=${parsed.cat}`
        : `${DOMAIN}/products`,
    },
    openGraph: {
      title: finalTitle,
      description: `Explore our premium ${categoryTitle} collection.`,
      url: `${DOMAIN}/products`,
      type: "website",
      images: [`${DOMAIN}/og-collections.jpg`],
    },
  };
}

// ─── ISR ─────────────────────────────────────────────────────────────────────
export const revalidate = 86400;

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<Record<string, string | string[]>>;
  params: Promise<{ locale: string }>;
}

export default async function PLPPage({ searchParams, params }: PageProps) {
  const { locale } = await params;
  const parsed = await searchParamsCache.parse(await searchParams);

  // 1. بناء بارامترات الـ API
  const apiParams = new URLSearchParams();
  if (parsed.q) apiParams.set("q", parsed.q);
  if (parsed.cat) apiParams.set("cat", parsed.cat);
  if (parsed.min) apiParams.set("min", String(parsed.min));
  if (parsed.max) apiParams.set("max", String(parsed.max));
  if (parsed.sizes.length) apiParams.set("sizes", parsed.sizes.join(","));
  apiParams.set("sort", parsed.sort);
  apiParams.set("page", String(parsed.page));
  apiParams.set("limit", "12");

  // 2. جلب البيانات على السيرفر (لسد خانة الـ Schema والـ Prefetch)
  const data = await fetchProductsData(apiParams);
  const products = data?.products || [];

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["products", parsed],
    queryFn: () => data,
  });

  // 3. بناء الـ Structured Data ديناميكياً
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${DOMAIN}/products#collection`,
    name: parsed.cat || "Fashion Collections",
    url: `${DOMAIN}/products`,
    description: `Browse all ${parsed.cat || "fashion"} products in our store.`,
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: parsed.cat || "Product List",
    itemListElement: products.map((prod: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${DOMAIN}/products/${prod.slug}`,
      name: prod.name,
      image: prod.image,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "ar" ? "الرئيسية" : "Home",
        item: DOMAIN,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "ar" ? "المنتجات" : "Products",
        item: `${DOMAIN}/products`,
      },
      ...(parsed.cat ?
        [
          {
            "@type": "ListItem",
            position: 3,
            name: parsed.cat,
            item: `${DOMAIN}/products?cat=${parsed.cat}`,
          },
        ]
      : []),
    ],
  };

  // Redis Tracking
  try {
    redisClient.incr("stats:products").catch(() => {});
  } catch (e) {
    console.error("Redis error in stats:products :", e);
  }

  const namespaces = [
    "PLP",
    "PLPParts",
    "FilterSidebar",
    "ProductCard",
    "Pagination",
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            categorySchema,
            itemListSchema,
            breadcrumbSchema,
          ]),
        }}
      />
      <ServerIntl namespaces={namespaces} params={params}>
        <Suspense
          fallback={<div className="h-screen animate-pulse bg-gray-50" />}
        >
          <PLPClient initialFilters={parsed as any} />
        </Suspense>
      </ServerIntl>
    </>
  );
}
