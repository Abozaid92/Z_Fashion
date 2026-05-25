import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchClothesBySlug } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
export const useGetProductBySlug = (slug: string) => {
  const query = useQuery({
    queryKey: ["slug", slug],
    queryFn: () => fetchClothesBySlug(slug),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return query;
};
