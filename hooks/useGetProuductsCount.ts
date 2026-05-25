import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductCount } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";

const getProductsCount = () => {
  const query = useQuery({
    queryKey: ["count"],
    queryFn: fetchProductCount,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });
  return query;
};

export default getProductsCount;
