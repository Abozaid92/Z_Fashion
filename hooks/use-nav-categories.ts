import { useQuery } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────
// Types — matches API response from /api/products/categories
// ─────────────────────────────────────────────────────────────
export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: NavCategory[];
}

export const navCategoryKeys = {
  all: ["nav-categories"] as const,
  list: () => [...navCategoryKeys.all, "list"] as const,
};

export async function fetchNavCategories(baseUrl = ""): Promise<NavCategory[]> {
  const res = await fetch(`${baseUrl}/api/products/categories`, {
    next: { revalidate: 86400, tags: ["nav_ctg"] },
  });
  if (!res.ok) throw new Error("Failed to fetch nav categories");
  return res.json();
}

// ── Client hook — data is pre-hydrated, never fetches on client ──
export function useNavCategories() {
  return useQuery<NavCategory[]>({
    queryKey: navCategoryKeys.list(),
    queryFn: () => fetchNavCategories(),
    // 5 min
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
