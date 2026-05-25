import { OrderStatus } from "@prisma/client";
import z from "zod";

export const orderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      size: z.enum(["Small", "Medium", "Large", "XLarge"]), // تأكد من مطابقة الـ Enum
    }),
  ),
  coupon: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

export interface productDetailsType {
  price: number;
  quantity: number;
  id: string;
}

export const getOrderSchema = z.object({
  orderNumber: z.coerce.number().optional().default(1),
  status: z.string().optional(),
});

export const updateOrderSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]), // حسب الـ Enum عندك في Prisma
});

export const getStatusCount = z.object({});
