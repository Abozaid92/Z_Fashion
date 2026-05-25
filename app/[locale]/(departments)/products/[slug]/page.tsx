// app/[locale]/products/[slug]/page.tsx
// ISR: revalidates every 60 seconds, streaming via Suspense

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ProductDetail } from "../../components/product";
import PDPGallery from "../../components/PDPGallery";
import PDPDetails from "../../components/PDPDetails";
import ReviewSection from "../../components/ReviewSection";
import { Carousel } from "@/components/homePage/Carousel";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { DOMAIN } from "@/lib/constants";
import ServerIntl from "@/lib/server-intl";
import getQueryClient from "@/lib/getQueryClient";
// ─── ISR ─────────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BASE = DOMAIN;

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(`${DOMAIN}/api/products/${slug}`, {
    next: { revalidate: 86400, tags: [`product-${slug}`] }, // ISR: 24 hours, cache by product slug
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

async function getRelatedProducts(catId: string, excludeId?: string) {
  try {
    const params = new URLSearchParams({
      catId,
      ...(excludeId && { excludeId }),
    });

    const response = await fetch(
      `${DOMAIN}/api/products/relatedProducts?${params.toString()}`,
      {
        method: "GET",
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch related products");
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("Fetch related products error:", error);
    return [];
  }
}

// ─── Static params (pre-generates popular PDPs at build time) ────────────────
// export async function generateStaticParams() {
//   try {
//     const products = await prisma.product.findMany({
//       where: {
//         inStock: true,
//       },
//       select: {
//         slug: true,
//       },
//       take: 50,
//       orderBy: {
//         rating: "desc",
//       },
//     });

//     if (!products || products.length === 0) return [];

//     // 💡 ملحوظة هامة: بما أن المسار عندك يحتوي على [locale]
//     // يجب أن ترجع الـ locale مع الـ slug لكي يعرف Next.js أي صفحات سيبني

//     const locales = ["ar", "en"]; // اللغات المدعومة في مشروعك

//     // إنشاء مصفوفة تحتوي على كل التركيبات الممكنة (Language + Slug)
//     return locales.flatMap((locale) =>
//       products.map((product) => ({
//         locale: locale,
//         slug: product.slug,
//       })),
//     );
//   } catch (error) {
//     console.error("❌ Error in generateStaticParams:", error);
//     return [];
//   }
// }

// ─── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const salePrice =
    product.discount && product.discount > 0 ?
      Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return {
    title: `${product.name} | Store`,
    description:
      product.description ??
      `Buy ${product.name} by ${product.brand} — EGP ${salePrice.toLocaleString()}`,
    openGraph: {
      title: product.name,
      description: product.description ?? "",
      images: [{ url: product.image, width: 800, height: 1067 }],
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}
// ─── JSON-LD structured data ──────────────────────────────────────────────────
async function ProductJsonLd({
  product,
  locale,
}: {
  product: ProductDetail;
  locale: string;
}) {
  let totalReviews = 0;
  let avgRating = 0;

  try {
    const statsRes = await fetch(
      `${BASE}/api/products/comments/stats?productId=${product.id}`,
      { next: { revalidate: 3600, tags: [`productStats-${product.id}`] } },
    );
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      totalReviews = statsData.totalComments;
      avgRating =
        statsData.stats.reduce(
          (acc: number, stat: any) => acc + stat.rating * stat.count,
          0,
        ) / (totalReviews || 1);
    }
  } catch (error) {
    console.error("Error fetching stats for JSON-LD:", error);
  }

  const salePrice =
    product.discount && product.discount > 0 ?
      Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  // 1. Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${BASE}/products/${product.slug}#product`,
    name: product.name,
    description: product.description ?? undefined,
    image: [product.image, ...product.gallery].slice(0, 5),
    brand: { "@type": "Brand", name: product.brand ?? "Unknown" },
    sku: product.slug, // استخدام الـ ID الحقيقي كـ SKU
    offers: {
      "@type": "Offer",
      url: `${BASE}/products/${product.slug}`,
      priceCurrency: "EGP",
      price: salePrice,
      availability:
        product.inStock ?
          "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  // 2. Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "ar" ? "الرئيسية" : "Home",
        item: BASE,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "ar" ? "المنتجات" : "Products",
        item: `${BASE}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${BASE}/products/${product.slug}`,
      },
    ],
  };

  // 3. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "ItemPage", // أدق لصفحة المنتج من WebPage
    "@id": `${BASE}/products/${product.slug}#webpage`,
    name: `${product.name} | ZFashion`,
    url: `${BASE}/products/${product.slug}`,
    isPartOf: { "@id": `${BASE}#website` }, // ربط بالـ Website الأساسي
    mainEntity: { "@id": `${BASE}/products/${product.slug}#product` }, // الإشارة للمنتج ككيان أساسي
    breadcrumb: { "@id": `${BASE}/products/${product.slug}#breadcrumb` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([
          productSchema,
          breadcrumbSchema,
          webPageSchema,
        ]),
      }}
    />
  );
}

// ─── Review skeleton (Suspense fallback) ─────────────────────────────────────
function ReviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading reviews">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-100" />
      <div className="rounded-xl border border-stone-200 bg-white p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-stone-100" />
            ))}
          </div>
          <div className="h-[400px] animate-pulse rounded-lg bg-stone-100" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl bg-stone-100" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function PDPPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(
    product.subCategoryId,
    product.id,
  );

  // Prefetch comments and stats on the server
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["comments", product.id],
    queryFn: async () => {
      const res = await fetch(
        `${BASE}/api/products/comments?productId=${product.id}`,
        { next: { revalidate: 3600, tags: [`productComment-${product.id}`] } }, // 1 hour
      );
      return res.json();
    },
    initialPageParam: null,
  });

  await queryClient.prefetchQuery({
    queryKey: ["commentsStats", product.id],
    queryFn: async () => {
      const res = await fetch(
        `${BASE}/api/products/comments/stats?productId=${product.id}`,
        { next: { revalidate: 3600, tags: [`productStats-${product.id}`] } },
      );
      return res.json();
    },
  });

  const images = [product.image, ...product.gallery].filter(Boolean);

  // Get total reviews for PDPDetails
  let totalReviews = 0;
  try {
    const statsRes = await fetch(
      `${BASE}/api/products/comments/stats?productId=${product.id}`,
      { next: { revalidate: 3600, tags: [`productStats-${product.id}`] } },
    );
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      totalReviews = statsData.totalComments;
    }
  } catch (error) {
    console.error("Error fetching total reviews:", error);
  }

  const namespaces = [
    "PDPDetails",
    "PDPGallery",
    "ReviewSection",
    "ProductActions",
    "Carousel",
  ];

  return (
    <ServerIntl namespaces={namespaces} params={{ locale }}>
      {/* JSON-LD — injected in <head> via Next.js */}
      <ProductJsonLd product={product} locale={locale} />

      <div className="min-h-screen bg-stone-50">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-stone-200 bg-white px-4 py-3 sm:px-6"
        >
          <ol className="flex items-center gap-2 text-[13px] text-stone-500">
            <li>
              <a href="/" className="transition-colors hover:text-stone-900">
                Home
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a
                href="/products"
                className="transition-colors hover:text-stone-900"
              >
                Men
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li
              className="truncate font-medium text-stone-900"
              aria-current="page"
            >
              {product.name}
            </li>
          </ol>
        </nav>

        {/* ── Main PDP layout ─────────────────────────────────────────────── */}
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[68px_1fr_320px]">
          <div className="lg:col-span-2">
            <PDPGallery images={images} productName={product.name} />
          </div>

          <div>
            <PDPDetails product={product} totalReviews={totalReviews} />
          </div>
        </div>

        {/* ── Related Products Header ────────────────────────────────────── */}
        <div className="mx-auto mb-7 max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-lime-600">
                Related Products
              </p>

              <h2 className="font-display truncate text-2xl font-bold leading-tight text-stone-950 sm:text-3xl lg:text-4xl">
                Related Products
              </h2>
            </div>
            <Link
              href={`${DOMAIN}/products?cat=${product.subCategoryId}`}
              className="group hidden shrink-0 items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-stone-500 transition-colors hover:text-lime-600 sm:inline-flex"
            >
              View all
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && <Carousel products={relatedProducts} />}

        {/* ── Reviews Section — wrapped in Suspense ────────────────────────*/}
        <div className="mx-auto max-w-[1200px] border-t border-stone-200 px-4 py-12 sm:px-6">
          <Suspense fallback={<ReviewSkeleton />}>
            <ReviewSection productId={product.id} productSlug={product.slug} />
          </Suspense>
        </div>
      </div>
    </ServerIntl>
  );
}
