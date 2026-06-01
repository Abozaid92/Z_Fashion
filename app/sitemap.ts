import { MetadataRoute } from "next";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const baseUrl = "https://z-fashion-ecru.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/en`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/en/cart`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/en/about`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/en/products`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.7,
      },
    ];

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/en/products/${cat.slug}`, // ✅ path بدل query string
      lastModified: new Date(cat.updatedAt),
      changeFrequency: "hourly",
      priority: 0.8,
    }));

    const productPages: MetadataRoute.Sitemap = products.map((prod) => ({
      url: `${baseUrl}/en/products/${prod.slug}`,
      lastModified: new Date(prod.updatedAt),
      changeFrequency: "hourly",
      priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [];
  }
}
