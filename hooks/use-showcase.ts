import {
  getCtgImage,
  getHomepageShowcaseComments,
  getHomepageShowcaseProducts,
} from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import { staleTime, gcTime } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
// import {
//   getHomepageShowcaseProducts,
//   getHomepageShowcaseComments,
//   getCtgImage,
// } from "@/app/[locale]/getMainProduct&SummaryActions";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface ShowcaseProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  discount?: number | null;
  image: string;
  gallery: string[];
  brand?: string | null;
  rating: number;
  category: { name: string; slug: string; image: string | null };
}
export interface showcaseCtgImage {
  image: string;
  name: string;
  slug: string;
}

export interface ShowcaseComment {
  id: string;
  content: string;
  rating: number;
  user: { name: string; image: string | null };
}

export interface ShowcaseCategoryGroup {
  products: ShowcaseProduct[];
}

// ─────────────────────────────────────────────────────────────
// Query Key Factory
// ─────────────────────────────────────────────────────────────
export const showcaseKeys = {
  all: ["showcase"] as const,
  products: () => [...showcaseKeys.all, "products"] as const,
  comments: () => [...showcaseKeys.all, "comments"] as const,
  ctgImag: () => [...showcaseKeys.all, "ctgImag"] as const,
  mainStats: () => [...showcaseKeys.all, "mainStats"] as const,
};

// ─────────────────────────────────────────────────────────────
// Hooks — data is pre-hydrated from server, no client fetch
// ─────────────────────────────────────────────────────────────
export function useShowcaseProducts() {
  return useQuery({
    queryKey: showcaseKeys.products(),
    queryFn: getHomepageShowcaseProducts,
    staleTime: staleTime,
    gcTime: gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    select: (data) => {
      if (!data.success || !data.data) return [];
      return data.data as ShowcaseCategoryGroup[];
    },
  });
}
export function useShowcasectgImage() {
  return useQuery({
    queryKey: showcaseKeys.ctgImag(),
    queryFn: getCtgImage,
    staleTime: staleTime,
    gcTime: gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    select: (data) => {
      if (!data.success || !data.data) return [];
      return data.data as showcaseCtgImage[];
    },
  });
}

export function useShowcaseComments() {
  return useQuery({
    queryKey: showcaseKeys.comments(),
    queryFn: getHomepageShowcaseComments,
    staleTime: staleTime,
    gcTime: gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    select: (data) => {
      if (!data.success || !data.data) return [];
      return data.data as ShowcaseComment[];
    },
  });
}
