import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const baseUrl = "https://z-fashion-ecru.vercel.app";
const locales = ["en", "ar", "de", "hi", "zh", "ru", "fr", "es"];

export async function GET() {
  try {
    // 1. جلب البيانات من الـ Database
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    });

    const now = new Date().toISOString();

    // 2. بناء رأس ملف الـ XML والـ Namespaces المطلوبة للترجمة
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // دالة مساعدة لإنشاء التاجات لكل رابط مع لغاته البديلة
    const createUrlNode = (
      path: string,
      lastMod: string,
      changeFreq: string,
      priority: string,
    ) => {
      let node = `
  <url>
    <loc>${baseUrl}/en${path}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>`;

      // إضافة الـ alternates الـ 8 لغات لكل مسار
      locales.forEach((locale) => {
        node += `
    <xhtml:link rel="alternate" hreflang="${locale}" href="${baseUrl}/${locale}${path}" />`;
      });

      node += `
  </url>`;
      return node;
    };

    // 3. إضافة الصفحات الثابتة
    xml += createUrlNode("", now, "hourly", "1.0");
    xml += createUrlNode("/cart", now, "weekly", "0.5");
    xml += createUrlNode("/about", now, "weekly", "0.5");
    xml += createUrlNode("/products", now, "hourly", "0.7");

    // 4. إضافة صفحات الأقسام ديناميكياً
    categories.forEach((category) => {
      const catPath = `/products?cat=${category.slug}`;
      const catDate = new Date(category.updatedAt).toISOString();
      xml += createUrlNode(catPath, catDate, "hourly", "0.8");
    });

    // 5. إضافة صفحات المنتجات ديناميكياً
    products.forEach((product) => {
      const prodPath = `/products/${product.slug}`;
      const prodDate = new Date(product.updatedAt).toISOString();
      xml += createUrlNode(prodPath, prodDate, "hourly", "0.7");
    });

    xml += `
</urlset>`;

    // 6. السحر كله هنا: إرجاع الاستجابة وإجبار الـ Content-Type على XML رغماً عن الجميع
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // كاش ذكي لمدة ساعة عشان السيرفر يبقى طلقة وميضغطش على الداتابيز
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
