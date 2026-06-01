import { NextResponse } from "next/server";

export async function GET() {
  // كود XML ثابت تماماً للتأكد من أن المسار شغال وصيغته سليمة
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://z-fashion-ecru.vercel.app/en</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // منع الكاش تماماً بكل الطرق الممكنة أثناء الاختبار
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
