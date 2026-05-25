import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
/**
 * @method GET
 * @description GET user profile
 * @route /api/users/profile
 * @access private (only Admin and user)
 * */

export async function GET() {
  try {
    const session = await auth();

    // لو مفيش يوزر، نطرده فوراً
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // استعلام واحد صارم جداً بيجيب اللي محتاجينه بس!
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true, // عشان نعرف هو ADMIN ولا USER في الفرونت
        status: true,

        // نجيب السلة (شكل مصغر - 3 منتجات بس مثلاً للعرض السريع)
        cart: {
          take: 3,
          select: {
            id: true,
            quantity: true,
            size: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                slug: true,
                gallery: true,
              },
            },
          },
        },

        // نجيب المفضلة (نجيب بيانات الـ ProductCard بس)
        favorite: {
          take: 4, // رقم مناسب للـ Grid
          select: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                slug: true,
                discount: true, // عشان لو فيه خصم يتعرض في الكارت
                rating: true,
                inStock: true,
              },
            },
          },
        },

        // نجيب الأوردرات (أحدث 3 أوردرات فقط كنبذة)
        order: {
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // خدعة صغيرة: تبسيط شكل الـ favorites عشان يبقى سهل يتباصى للـ ProductCard
    const formattedProfile = {
      ...userProfile,
      favorite: userProfile.favorite.map((fav) => fav.product),
    };

    return NextResponse.json(formattedProfile, { status: 200 });
  } catch (error) {
    console.error("[PROFILE_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
