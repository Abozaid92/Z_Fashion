// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "http://localhost:3000";

  return {
    rules: {
      userAgent: "*", // الكلام ده لكل محركات البحث (جوجل، بينج، إلخ)
      allow: "/",
      disallow: [
        "/admin", // ممنوع دخول محركات البحث لصفحات الأدمن ❌
        "/api", // ممنوع دخولهم للـ API routes لحماية بياناتك ❌
        "/*/admin", // عشان لو الرابط بدايته لغة زي /ar/admin
        "/*/api",
      ],
    },
    // بنشاور لجوجل على مكان الخريطة اللي لسه عاملينها
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
