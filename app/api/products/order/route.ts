import { adminGuard, userGuard } from "@/lib/userGuards";
import { NextResponse, NextRequest } from "next/server";
import {
  getOrderSchema,
  OrderInput,
  orderSchema,
  productDetailsType,
  updateOrderSchema,
} from "../../utils/createOrderSchema";
import { Coupon } from "@prisma/client";
import prisma from "@/lib/db";
import { orderPerPage } from "@/lib/constants";
import redisClient from "@/lib/redisClient";
/**
 * @method POST
 * @description create a new order
 * @route /api/products/order
 * @access public (only user login)
 * */

export const POST = userGuard(
  orderSchema,
  async (request: NextRequest, userId, data) => {
    try {
      let coupon: Coupon | null = null;
      if (data.coupon) {
        try {
          coupon = await checkIfCouponExist(data);
        } catch (error: any) {
          return NextResponse.json(
            { message: error.message || "Invalid coupon" },
            { status: 400 },
          );
        }
        const isCouponUsed = await prisma?.userCoupon.findUnique({
          where: {
            userId_couponCode: {
              userId: userId,
              couponCode: data.coupon,
            },
          },
        });
        if (isCouponUsed)
          return NextResponse.json(
            { message: "You have already used this coupon code." },
            { status: 400 },
          );
      }
      // order part
      const productDetails = await matchProductsPricesinDBAndrequest(data);
      const totalAmount = await getTotalAmount(productDetails, coupon);
      // @TODO
      // حاول خفف الروات ده علي قد ما تقدر
      await prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            userId: userId,
            totalAmount: totalAmount,
            status: data.status,
            orderItems: {
              createMany: {
                data: productDetails.map((el) => ({
                  price: el.price,
                  quantity: el.quantity,
                  productId: el.id,
                })),
              },
            },
          },
        });

        if (data.coupon) {
          await tx.coupon.update({
            where: { code: data.coupon },
            data: { usedCount: { increment: 1 } },
          });
          await tx.userCoupon.create({
            data: {
              userId: userId,
              couponCode: data.coupon,
            },
          });
        }
      });
      //  redis
      addProductsToRedis(productDetails);

      return NextResponse.json(
        { message: "we create a new order" },
        { status: 201 },
      );
    } catch (error) {
      return NextResponse.json({ message: "Error" }, { status: 500 });
    }
  },
);

const getProductsPrices = async (date: OrderInput) => {
  const productsIds = date.items.map((el) => el.productId);
  const productssPrice = await prisma?.product.findMany({
    where: {
      id: {
        in: productsIds,
      },
    },
    select: {
      id: true,
      price: true,
    },
  });

  return productssPrice;
};

// return productDetails
const matchProductsPricesinDBAndrequest = async (data: OrderInput) => {
  const productsPrices = await getProductsPrices(data);
  return data.items.map((el) => {
    const sesrchOnProduct = productsPrices?.find(
      (item) => item.id === el.productId,
    );
    if (sesrchOnProduct) {
      return {
        price: sesrchOnProduct.price,
        quantity: el.quantity,
        id: sesrchOnProduct.id,
      };
    }
    throw new Error(` this product is not defing ${el.productId}`);
  });
};

const getTotalAmount = async (
  productDetails: productDetailsType[],
  coupon: Coupon | null,
) => {
  const totalAmount = productDetails.reduce((acc, current) => {
    return acc + current.price * current.quantity;
  }, 0);
  return coupon ? (totalAmount * coupon.discount) / 100 : totalAmount;
};

const checkIfCouponExist = async (data: OrderInput) => {
  const coupon = await prisma?.coupon.findUnique({
    where: {
      code: data.coupon,
    },
  });
  if (!coupon) throw new Error("token not found");

  if (new Date() > coupon.expiryDate) throw new Error("token is expierd");
  return coupon;
};

const addProductsToRedis = (data: productDetailsType[]) => {
  (async () => {
    try {
      await Promise.all(
        data.map(async (el) => {
          const product = await prisma.product.findUnique({
            where: { id: el.id },
            select: { slug: true },
          });

          if (product?.slug) {
            await redisClient.zIncrBy(
              "stats:leaderboardProducts:inOrders",
              el.quantity,
              product.slug,
            );
          }
        }),
      );
      // console.log("Redis Leaderboard Updated");
    } catch (error) {
      console.error("Redis Background Task Error:", error);
    }
  })();
};
/*
 *@method GET
 * @description Get All Orders with pagination and status filtering
 * @route /api/products/order
 * @access Private (Admin only)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // استلام المعاملات من الرابط مع وضع قيم افتراضية
    const pageNumber = searchParams.get("pageNumber") || "1";
    const status = searchParams.get("status");

    // جلب البيانات بناءً على الصفحة والفلتر
    const orders = await getOrders(+pageNumber, status);

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 },
    );
  }
}
/**
 * دالة مساعدة لجلب الطلبات من قاعدة البيانات
 */
const getOrders = async (pageNumber: number, status: string | null) => {
  // بناء شرط البحث: لو الـ status موجود هنفلتر بيه، لو null الـ whereClause هتكون فاضية
  const whereClause = status ? { status: status as any } : {};

  const Orders = await prisma.order.findMany({
    where: whereClause,
    take: orderPerPage,
    skip: orderPerPage * (pageNumber - 1),
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          image: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        select: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  return Orders;
};

/** * @method PATCH
 * @description Update order status
 * @route /api/products/order
 * @access private (Admin only)
 */

// هتحتاج تضيف updateOrderSchema في ملف الـ utils بتاعك
export const PATCH = adminGuard(
  updateOrderSchema,
  async (request: NextRequest, userId, data) => {
    try {
      // 1. التأكد من وجود الطلب وتحديث حالته
      const updatedOrder = await updateOrderStatus(data.orderId, data.status);

      return NextResponse.json(
        { message: "Order status updated successfully", order: updatedOrder },
        { status: 200 },
      );
    } catch (error: any) {
      if (error.message === "Order not found") {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      return NextResponse.json(
        { message: "Error updating order" },
        { status: 500 },
      );
    }
  },
);

const updateOrderStatus = async (orderId: string, newStatus: any) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Order not found");

  // التحديث
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
};
