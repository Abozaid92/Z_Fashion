import { MetadataRoute } from "next";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const baseUrl = "https://z-fashion-ecru.vercel.app";
const locales = ["en", "ar", "de", "hi", "zh", "ru", "fr", "es"];

const getAlternates = (path: string) => {
  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    languages[locale] = `${baseUrl}/${locale}${path}`;
  });
  return { languages };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    });

    const now = new Date();

    const staticPages = [
      {
        url: `${baseUrl}/en`,
        lastModified: now,
        changeFrequency: "hourly" as const,
        priority: 1.0,
        alternates: getAlternates(""),
      },
      {
        url: `${baseUrl}/en/cart`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
        alternates: getAlternates("/cart"),
      },
      {
        url: `${baseUrl}/en/about`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
        alternates: getAlternates("/about"),
      },
      {
        url: `${baseUrl}/en/products`,
        lastModified: now,
        changeFrequency: "hourly" as const,
        priority: 0.7,
        alternates: getAlternates("/products"),
      },
    ];

    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/en/products?cat=${category.slug}`,
      lastModified: new Date(category.updatedAt),
      changeFrequency: "hourly" as const,
      priority: 0.8,
      alternates: getAlternates(`/products?cat=${category.slug}`),
    }));

    const productPages = products.map((product) => ({
      url: `${baseUrl}/en/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "hourly" as const,
      priority: 0.7,
      alternates: getAlternates(`/products/${product.slug}`),
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [];
  }
}
