// _validations/product.schema.ts
import { z } from "zod";

export const productSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(120, "Name must be under 120 characters"),

    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),

    price: z
      .number({ invalid_type_error: "Price is required" })
      .positive("Price must be greater than 0"),

    compareAtPrice: z
      .number()
      .positive("Must be greater than 0")
      .optional()
      .or(z.literal(NaN).transform(() => undefined)), // handles empty number input

    category: z.string().min(1, "Category is required"),

    status: z.enum(["active", "draft", "archived"]).default("draft"),

    inventory: z
      .number({ invalid_type_error: "Stock quantity is required" })
      .int("Must be a whole number")
      .nonnegative("Cannot be negative"),

    sku: z
      .string()
      .min(1, "SKU is required")
      .regex(/^[A-Za-z0-9\-_]+$/, "Only letters, numbers, and hyphens allowed"),

    tags: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.compareAtPrice && data.compareAtPrice <= data.price)
        return false;
      return true;
    },
    {
      message: "Compare-at price must be higher than the actual price",
      path: ["compareAtPrice"],
    },
  );

export type ProductFormValues = z.infer<typeof productSchema>;
