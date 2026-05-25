"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
} from "nuqs";
import { ProductCard } from "@/components/homePage/product-card";
import FilterSidebar from "./FilterSidebar";
import { PLPHero, PLPToolbar, Pagination } from "./PLPParts";
import type { PLPFilters, ProductsResponse, Size } from "./product";
import { staleTime, gcTime, DOMAIN } from "@/lib/constants";
// ─── Skeleton grid ────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-stone-200">
      <div className="aspect-[3/4] animate-pulse bg-stone-100" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-stone-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />
      </div>
    </div>
  );
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────
async function fetchProducts(filters: PLPFilters): Promise<ProductsResponse> {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.cat) p.set("cat", filters.cat);
  if (filters.min) p.set("min", String(filters.min));
  if (filters.max) p.set("max", String(filters.max));
  if (filters.sizes.length) p.set("sizes", filters.sizes.join(","));
  p.set("sort", filters.sort);
  p.set("page", String(filters.page));
  p.set("limit", "12");

  const res = await fetch(`${DOMAIN}/api/products?${p.toString()}`, {
    next: {
      revalidate: 86400,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// ─── Client page ─────────────────────────────────────────────────────────────
interface PLPClientProps {
  initialFilters: PLPFilters;
}

export default function PLPClient({ initialFilters }: PLPClientProps) {
  const t: any = useTranslations();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── nuqs: each filter param ↔ URL param ───────────────────────────────────
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [cat, setCat] = useQueryState("cat", parseAsString.withDefault(""));
  const [min, setMin] = useQueryState("min", parseAsInteger.withDefault(0));
  const [max, setMax] = useQueryState("max", parseAsInteger.withDefault(0));
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("newest"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sizes, setSizes] = useQueryState(
    "sizes",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  const filters: PLPFilters = {
    q,
    cat,
    min,
    max,
    sort: sort as PLPFilters["sort"],
    page,
    sizes: sizes as Size[],
  };

  // Batch-update URL params and reset page
  const handleFilterChange = useCallback(
    (patch: Partial<PLPFilters>) => {
      if ("q" in patch) setQ(patch.q ?? "");
      if ("cat" in patch) setCat(patch.cat ?? "");
      if ("min" in patch) setMin(patch.min ?? 0);
      if ("max" in patch) setMax(patch.max ?? 0);
      if ("sort" in patch) setSort(patch.sort ?? "newest");
      if ("sizes" in patch) setSizes((patch.sizes ?? []) as string[]);
      if ("page" in patch) setPage(patch.page ?? 1);
      else setPage(1); // always reset page on filter change
    },
    [setQ, setCat, setMin, setMax, setSort, setSizes, setPage],
  );

  // ── TanStack Query — server-hydrated, no loading flash ────────────────────
  const { data, isLoading, isError } = useQuery<ProductsResponse>({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: staleTime,
    gcTime: gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev, // keeps previous data while fetching → no CLS
  });

  const products = data?.products ?? [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <PLPHero
        title={t("PLP.title_mens_collection")}
        subtitle={t("PLP.subtitle_shop")}
        count={meta?.totalCount ?? 0}
      />

      {/* Toolbar */}
      <PLPToolbar
        filters={filters}
        totalCount={meta?.totalCount ?? 0}
        onFilterChange={handleFilterChange}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Body */}
      <div className="mx-auto flex max-w-[1280px] gap-8 px-4 py-6 sm:px-6">
        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Error state */}
          {isError && (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 py-20 text-center"
            >
              <p className="text-stone-500">
                {t("PLP.errors.failed_to_load_products")}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg border border-stone-300 px-4 py-2 text-[13px] hover:bg-stone-50"
              >
                {t("PLP.actions.retry")}
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-[16px] font-medium text-stone-700">
                {t("PLP.empty.no_products")}
              </p>
              <p className="text-[13px] text-stone-500">
                {t("PLP.empty.try_adjusting")}
              </p>
              <button
                type="button"
                onClick={() =>
                  handleFilterChange({
                    q: "",
                    cat: "",
                    sizes: [],
                    min: 0,
                    max: 0,
                    page: 1,
                  })
                }
                className="rounded-lg border border-stone-200 px-5 py-2.5 text-[13px] hover:border-stone-300"
              >
                {t("PLP.actions.clear_filters_button")}
              </button>
            </div>
          )}

          {/* Grid */}
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            role="list"
            aria-busy={isLoading}
          >
            {isLoading ?
              Array.from({ length: 12 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            : products.map((p, i) => (
                <ProductCard key={p.id} {...p} priority={i < 4} />
              ))
            }
          </div>

          {/* Pagination */}
          {meta && (
            <Pagination
              page={filters.page}
              totalPages={meta.totalPages}
              onChange={(p) => handleFilterChange({ page: p })}
            />
          )}
        </main>
      </div>
    </div>
  );
}
