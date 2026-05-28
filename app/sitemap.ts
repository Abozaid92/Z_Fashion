// app/sitemap.ts
import { MetadataRoute } from "next";
import prisma from "@/lib/db";

const baseUrl = "http://localhost:3000";
// ترتيب اللغات (الإنجليزي هو الملك أول واحد)
const locales = ["en", "ar", "de", "hi", "zh", "ru", "fr", "es"];

// دالة مساعدة سحرية بتولد الـ 8 لغات لكل رابط في ثانية
const getAlternates = (path: string) => {
  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    languages[locale] = `${baseUrl}/${locale}${path}`;
  });
  return { languages };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ==========================================
  // 1. الصفحات الثابتة بالـ 8 لغات (الإنجليزي أساسي)
  // ==========================================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/en`, // الرابط الرئيسي إنجليزي
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
      alternates: getAlternates(""),
    },
    {
      url: `${baseUrl}/en/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: getAlternates("/cart"),
    },
    {
      url: `${baseUrl}/en/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: getAlternates("/about"),
    },
    {
      url: `${baseUrl}/en/products`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.7,
      alternates: getAlternates("/products"),
    },
  ];

  // ==========================================
  // 2. صفحات الأقسام اللي في الناف بار بالـ 8 لغات
  // ==========================================
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/en/products?cat=${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: "hourly",
    priority: 0.8,
    alternates: getAlternates(`/products?cat=${category.slug}`),
  }));

  // ==========================================
  // 3. صفحات المنتجات ديناميكياً بالـ 8 لغات
  // ==========================================
  const products = await prisma.product.findMany({
    select: { slug: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/en/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "hourly",
    priority: 0.7,
    alternates: getAlternates(`/products/${product.slug}`),
  }));

  // تجميع كل الروابط العالمية (ثابتة + أقسام الناف + منتجات)
  return [...staticPages, ...categoryPages, ...productPages];
}
