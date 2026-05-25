import { DOMAIN } from "@/lib/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null; // ✅ added
  parentId?: string | null;
  parent?: Category | null;
  children: Category[];
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export type CreateCategoryInput =
  | {
      mode: "CREATE_NEW";
      name: string;
      slug: string;
      image?: string | null; // ✅ added
      children?: { name: string; slug: string }[];
    }
  | {
      mode: "ADD_TO_EXISTING";
      parentId: string;
      children: { name: string; slug: string }[];
    };

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  slug?: string;
  image?: string | null; // ✅ added
  parentId?: string | null;
}

// ─────────────────────────────────────────────────────────────
// Query Key Factory
// ─────────────────────────────────────────────────────────────
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: () => [...categoryKeys.lists()] as const,
};

// ─────────────────────────────────────────────────────────────
// API helpers
// الـ API بيرجع root categories فقط مع children متداخلين جوا كل واحدة
// ─────────────────────────────────────────────────────────────
export async function fetchCategories(baseUrl = ""): Promise<Category[]> {
  const res = await fetch(`${DOMAIN}/api/products/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────
export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: categoryKeys.list(),
    queryFn: () => fetchCategories(),
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryInput) => {
      const res = await fetch("/api/products/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to create category");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCategoryInput) => {
      const res = await fetch("/api/products/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to update category");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/products/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to delete category");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
