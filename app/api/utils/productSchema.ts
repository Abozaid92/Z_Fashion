import { Gender, Size } from "@prisma/client";
import { z } from "zod";

// تعريف الـ Enum عشان Zod يفهمه
export const CreateProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  slug: z.string().min(2),
  image: z.string().url(),
  gallery: z.array(z.string().url()).default([]),
  subCategoryId: z.string().min(1),
  brand: z.string().optional(),
  gender: z.array(z.nativeEnum(Gender)).default([]),
  size: z.array(z.nativeEnum(Size)).default([]),
  inStock: z.boolean().default(true),
  countStock: z.number().int().nonnegative().optional(),
  discount: z.number().int().min(0).max(100).default(0),
  rating: z.number().min(0).max(5).default(0),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().min(1, "Product ID is required"),
});

export const DeleteProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});
