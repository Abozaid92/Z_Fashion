import { DOMAIN } from "@/lib/constants";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface ProductFilters {
  search?: string;
  min?: number;
  max?: number;
  rating?: number;
  gender?: string[];
  size?: string[];
  pageNumber?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  gallery: string[];
  brand?: string;
  rating: number;
  inStock: boolean;
  countStock?: number;
  discount?: number;
  slug: string;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  gender: string[];
  size: string[];
  favorite: { userId: string; productId: string }[];
  createdAt: string;
  updatedAt: string;
}
export interface data {
  products: Product[];
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  slug: string;
  image: string;
  gallery?: string[];
  categoryId: string;
  brand?: string;
  gender?: string[];
  size?: string[];
  inStock?: boolean;
  countStock?: number;
  discount?: number;
  rating?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

// ─────────────────────────────────────────────────────────────
// Query Key Factory
// ─────────────────────────────────────────────────────────────
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
};

// ─────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────
function buildParams(filters: ProductFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.search) p.set("search", filters.search);
  if (filters.min && filters.min > 0) p.set("min", String(filters.min));
  if (filters.max && filters.max > 0) p.set("max", String(filters.max));
  if (filters.rating && filters.rating > 0)
    p.set("rating", String(filters.rating));
  filters.gender?.forEach((g) => p.append("gender", g));
  filters.size?.forEach((s) => p.append("size", s));
  p.set("pageNumber", String(filters.pageNumber ?? 1));
  return p;
}

export async function fetchProducts(
  filters: ProductFilters,
): Promise<Product[]> {
  const params = buildParams(filters);
  const res = await fetch(`${DOMAIN}/api/products?${params}`, {});
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────
export function useProductsQuery(
  filters: ProductFilters,
  options?: Partial<UseQueryOptions<Product[]>>,
) {
  return useQuery<Product[]>({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 30,
    ...options,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to create product");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProductInput) => {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to update product");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to delete product");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
