"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import {
  AddToCartInput,
  AddToCartSchema,
  DeleteProductSchema,
  DeleteCartInput,
} from "./AddProductSchema";
import redisClient from "@/lib/redisClient";
export const AddToCartAction = async (params: AddToCartInput) => {
  try {
    const session = await auth();

    const validation = AddToCartSchema.safeParse(params);
    if (validation.success === false) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }

    if (!session?.user.id || !session?.user) {
      return { success: false, message: "only login user" };
    }

    await prisma.cart.upsert({
      where: {
        userId_productId_size: {
          productId: params.productId,
          userId: session?.user.id,
          size: params.size,
        },
      },
      update: {
        quantity: { increment: params.quantity },
      },
      create: {
        productId: params.productId,
        userId: session.user.id,
        quantity: params.quantity,
        size: params.size,
      },
    });

    (async () => {
      try {
        const product = await prisma.product.findUnique({
          where: { id: params.productId },
          select: { slug: true },
        });
        if (product?.slug) {
          await redisClient.zIncrBy(
            "stats:leaderboardProducts:incart",
            params.quantity,
            product?.slug!,
          );
        }
      } catch (error) {
        console.error("Redis Error :", error);
      }
    })();
    return { success: true, message: "Added to cart!" };
  } catch (error) {
    return { success: false, message: error };
  }
};

export const GetCartItemsAction = async () => {
  try {
    const session = await auth();

    if (!session?.user.id || !session?.user) {
      return { success: false, message: "only login user" };
    }

    const ProductInCard = await prisma.cart.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            price: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: ProductInCard };
  } catch (error) {
    return { success: false, message: error };
  }
};
export const DeleteOneProductAction = async (params: DeleteCartInput) => {
  try {
    const session = await auth();
    if (!session?.user.id || !session?.user) {
      return { success: false, message: "only login user" };
    }

    const validation = DeleteProductSchema.safeParse(params);
    if (validation.success === false) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }

    await prisma.cart.delete({
      where: {
        userId_productId_size: {
          userId: session.user.id,
          productId: params.productId,
          size: params.size,
        },
      },
    });
    return { success: true, data: "Product Deleted SuccessFully" };
  } catch (error) {
    return { success: false, message: error };
  }
};

export const DeleteAllProductAction = async () => {
  try {
    const session = await auth();
    if (!session?.user.id || !session?.user) {
      return { success: false, message: "only login user" };
    }

    await prisma.cart.deleteMany({
      where: {
        userId: session.user.id,
      },
    });
    return {
      success: true,
      data: "All Products has been Deleted SuccessFully",
    };
  } catch (error) {
    return { success: false, message: error };
  }
};

export const updateQuantityAction = async (params: {
  productId: string;
  size: any; // استخدم النوع المناسب من Prisma عندك
  quantity: number;
}) => {
  try {
    const session = await auth();

    // 1. التحقق من تسجيل الدخول
    if (!session?.user?.id) {
      return { success: false, message: "يجب تسجيل الدخول أولاً" };
    }

    if (params.quantity < 1) {
      return { success: false, message: "الكمية يجب أن تكون 1 على الأقل" };
    }

    // 3. تحديث الكمية في قاعدة البيانات
    const updatedItem = await prisma.cart.update({
      where: {
        userId_productId_size: {
          userId: session.user.id,
          productId: params.productId,
          size: params.size,
        },
      },
      data: {
        quantity: params.quantity,
      },
    });

    return {
      success: true,
      data: updatedItem,
      message: "quantity have benn updated SuccessFully",
    };
  } catch (error) {
    return {
      success: false,
      message: "failed to update quantity",
    };
  }
};
