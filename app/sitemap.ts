import { MetadataRoute } from "next";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const baseUrl = "https://z-fashion-ecru.vercel.app";
const locales = ["en", "ar"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const now = new Date();

    // الصفحات الثابتة بـ en و ar
    const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) => [
      {
        url: `${baseUrl}/${locale}`,
        lastModified: now,
        changeFrequency: "hourly" as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/${locale}/cart`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/${locale}/about`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/${locale}/products`,
        lastModified: now,
        changeFrequency: "hourly" as const,
        priority: 0.7,
      },
    ]);

    // الكاتيجوريز بـ en و ar
    const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/products?cat=${cat.slug}`,
        lastModified: new Date(cat.updatedAt),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      })),
    );

    // المنتجات بـ en و ar
    const productPages: MetadataRoute.Sitemap = products.flatMap((prod) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/products/${prod.slug}`,
        lastModified: new Date(prod.updatedAt),
        changeFrequency: "hourly" as const,
        priority: 0.7,
      })),
    );

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [];
  }
}
