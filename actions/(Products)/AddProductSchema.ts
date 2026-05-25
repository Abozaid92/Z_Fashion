import { z } from "zod";
import { Size } from "@prisma/client";
export const AddToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(99, "You cannot add more than 99 items at once"),
  size: z.nativeEnum(Size, {
    errorMap: () => ({
      message: "Please select a valid size (Small, Medium, Large, or XLarge)",
    }),
  }),
});
export const DeleteProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  size: z.nativeEnum(Size, {
    errorMap: () => ({
      message: "Please select a valid size (Small, Medium, Large, or XLarge)",
    }),
  }),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type DeleteCartInput = z.infer<typeof DeleteProductSchema>;
