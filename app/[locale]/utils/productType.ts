import { Size, Gender } from "@prisma/client";
interface Favorite {
  id: string;
  userId: string;
  productId: string;
}
export interface Product {
  id: string;
  name: string;
  description: string | null; // علامة ? تعني أنه اختياري (Optional)
  price: number; // في TypeScript نستخدم number للتعامل مع Decimal
  image: string;
  gallery: string[];
  category: string;
  gender: Gender[];
  brand?: string | null;
  rating: number;
  size: Size[]; // مصفوفة من المقاسات
  inStock: boolean;
  countStock?: number | null;
  discount?: number | null;
  slug: string;
  favorite?: Favorite[];
  createdAt: Date;
  updatedAt: Date;
}
export interface CartItemType {
  id: string;
  product: Product;
  productId: String;
  quantity: number;
  userId: string;
  size: Size;
}
