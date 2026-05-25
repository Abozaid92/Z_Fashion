"use server";

import prisma from "@/lib/db";
import { auth } from "@/auth";
export const GetOrdersAction = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "only login user" };
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
                slug: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: orders };
  } catch (error) {
    return { success: false, message: "failed to get orders" };
  }
};

export const CancelOrderAction = async (orderId: string) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "only login user" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== session.user.id) {
      return { success: false, message: "Order not found" };
    }

    if (
      order.status === "SHIPPED" ||
      order.status === "DELIVERED" ||
      order.status === "CANCELLED"
    ) {
      return {
        success: false,
        message: "Cannot cancel this order",
      };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
      },
    });

    return {
      success: true,
      data: updated,
      message: "Order cancelled successfully",
    };
  } catch (error) {
    return { success: false, message: "failed to cancel order" };
  }
};
