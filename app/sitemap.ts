import { MetadataRoute } from "next";
import prisma from "@/lib/db";

// إجبار السيت ماب إنها تكون ديناميكية تماماً وتجيب البيانات لايف من الداتابيز مع كل زيارة
export const dynamic = "force-dynamic";
export const revalidate = 0;

const baseUrl = "https://z-fashion-ecru.vercel.app";
const locales = ["en", "ar", "de", "hi", "zh", "ru", "fr", "es"];

// دالة مساعدة لإنشاء روابط اللغات البديلة (Alternates) تلقائياً لكل مسار
const getAlternates = (path: string) => {
  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    languages[locale] = `${baseUrl}/${locale}${path}`;
  });
  return { languages };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // 1. جلب البيانات من الداتابيز (الـ الأقسام والمنتجات)
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    });

    const now = new Date();

    // 2. المسارات الثابتة الأساسية للموقع (الصفحة الرئيسية، السلة، عن الموقع، المنتجات)
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

    // 3. تحويل الأقسام الديناميكية القادمة من الداتابيز
    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/en/products?cat=${category.slug}`,
      lastModified: new Date(category.updatedAt),
      changeFrequency: "hourly" as const,
      priority: 0.8,
      alternates: getAlternates(`/products?cat=${category.slug}`),
    }));

    // 4. تحويل المنتجات الديناميكية القادمة من الداتابيز
    const productPages = products.map((product) => ({
      url: `${baseUrl}/en/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "hourly" as const,
      priority: 0.7,
      alternates: getAlternates(`/products/${product.slug}`),
    }));

    // دمج كل المصفوفات وإرجاعها لـ Next.js ليقوم بإنشاء الـ XML بالهيدرز الصحيحة تلقائياً
    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // في حالة حدوث أي خطأ مفاجئ في السيرفر، يرجع مصفوفة فارغة لحماية الموقع من الـ Crash
    return [];
  }
}
