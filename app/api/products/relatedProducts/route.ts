import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const catId = searchParams.get("catId");
    const excludeId = searchParams.get("excludeId");

    if (!catId) {
      return NextResponse.json(
        { success: false, error: "catId is required" },
        { status: 400 },
      );
    }

    // 3. جلب المنتجات من قاعدة البيانات
    const products = await prisma.product.findMany({
      where: {
        subCategoryId: catId,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
      take: 8, // هنجيب 8 منتجات عشان الـ Carousel يكون مليان
      orderBy: {
        createdAt: "desc", // الأحدث أولاً
      },
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        discount: true,
        image: true,
        gallery: true,
        brand: true,
        category: { select: { name: true, slug: true } },
      },
    });
    // const filterProducts = excludeTheCurrentProduct(products, excludeId);

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("RELATED_PRODUCTS_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

const excludeTheCurrentProduct = async (products: any, excludeId: any) => {
  const filterd = products.filter((el: any) => el.id !== excludeId);
  return filterd;
};
