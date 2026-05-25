// ─── Enums (mirror your Prisma schema) ─────────────────────────────────────
export type Gender = "kids" | "male" | "female" | "unisex";
export type Size = "Small" | "Medium" | "Large" | "XLarge";
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

// ─── Product ────────────────────────────────────────────────────────────────
export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  discount: number | null;
  image: string;
  gallery: string[];
  brand: string | null;
  rating: number;
  subCategoryId: string;
  category: { name: string; slug: string };
}

export interface ProductDetail extends ProductCardData {
  description: string | null;
  inStock: boolean;
  countStock: number | null;
  gender: Gender[];
  size: Size[];
  createdAt: string;
}

// ─── PLP filters (maps 1-to-1 with nuqs URL params) ─────────────────────────
export interface PLPFilters {
  q: string;
  cat: string;
  min: number;
  max: number;
  sizes: Size[];
  sort: "newest" | "price-asc" | "price-desc" | "top-rated" | "discount";
  page: number;
}

// ─── API responses ───────────────────────────────────────────────────────────
export interface ProductsResponse {
  products: ProductCardData[];
  meta: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

// ─── Comments ────────────────────────────────────────────────────────────────
export interface Comment {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  user: { name: string | null; image: string | null };
  /** client-only: true while waiting for server confirmation */
  _optimistic?: boolean;
}

export interface CommentsPage {
  comments: Comment[];
  nextCursor: string | null;
}

// ─── Rating distribution (for breakdown bar chart) ──────────────────────────
export type RatingDist = Record<1 | 2 | 3 | 4 | 5, number>;
