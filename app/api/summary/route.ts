import prisma from "@/lib/db";
import { NextResponse } from "next/server";
/**
 * @method GET
 * @description GET all main page content
 * @route /api/summary
 * @access public
 * */

export const GET = async () => {
  try {
    const [products, catsImage, comments] = await Promise.all([
      getHomepageShowcaseProducts(),
      getCtgImage(),
      getHomepageShowcaseComments(),
    ]);
    const data = {
      products,
      catsImage,
      comments,
    };
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // console.log("there is an error in route summaty", error);
  }
};

async function getHomepageShowcaseProducts() {
  try {
    // الأقسام اللي أنت حددتها
    const targetCategories = ["Shirts", "women", "pants", "jackets"];

    // بنفذ الطلبات كلها بالتوازي عشان السرعة
    const showcaseData = await Promise.all(
      targetCategories.map(async (catName) => {
        const products = await prisma.product.findMany({
          where: {
            category: { name: catName },
            inStock: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            discount: true,
            image: true,
            gallery: true,
            brand: true,

            // بس أول صورتين عشان حركة الـ Flip
            category: { select: { name: true, slug: true } },
          },
        });
        return { products };
      }),
    );
    // console.log("Showcase data fetched:", showcaseData);
    // console.log("--------------------------------------------");
    // console.log(
    //   "Showcase products by category:",
    //   await prisma.product.findMany({
    //     where: {
    //       category: { name: "Shirts" },
    //     },
    //   }),
    // );
    return { success: true, data: showcaseData };
  } catch (error) {
    console.error("SHOWCASE_ACTION_ERROR:", error);
    return { success: false, error: "Failed to load showcase" };
  }
}

async function getCtgImage() {
  try {
    const catsImage = await prisma.category.findMany({
      where: { parentId: null },
      select: { image: true, name: true, slug: true },
    });
    return { success: true, data: catsImage };
  } catch (error) {
    console.error("SHOWCASE_ACTION_ERROR:", error);
    return { success: false, error: "Failed to load showcase" };
  }
}
async function getHomepageShowcaseComments() {
  try {
    const comments = await prisma.comment.findMany({
      where: { rating: 5 },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        content: true,
        rating: true,
        user: {
          select: { name: true, image: true }, // هات بس اسم وصورة العميل
        },
      },
    });
    return { success: true, data: comments };
  } catch (error) {
    return { success: false, error: "Failed to load comments" };
  }
}
