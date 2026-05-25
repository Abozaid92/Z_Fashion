import prisma from "@/lib/db";

export async function getHomepageShowcaseProducts() {
  try {
    // الأقسام اللي أنت حددتها
    const targetCategories = ["men", "women", "pants", "Jacket"];

    // بنفذ الطلبات كلها بالتوازي عشان السرعة
    const showcaseData = await Promise.all(
      targetCategories.map(async (catName) => {
        const products = await prisma.product.findMany({
          where: {
            category: { name: catName },
            inStock: true,
          },
          take: 6,
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
    return { success: true, data: showcaseData };
  } catch (error) {
    console.error("SHOWCASE_ACTION_ERROR:", error);
    return { success: false, error: "Failed to load showcase" };
  }
}

export async function getCtgImage() {
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
export async function getHomepageShowcaseComments() {
  try {
    const comments = await prisma.comment.findMany({
      where: { rating: 5 },
      orderBy: { createdAt: "desc" },
      take: 4,
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
