import { useQuery } from "@tanstack/react-query";

const fetchOrdersCount = async (status: string | null): Promise<number> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);

  const response = await fetch(
    `/api/products/order/count?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch count");
  }

  return response.json();
};

export const useOrdersCount = (status: string | null) => {
  return useQuery<number>({
    queryKey: ["orders-count", status],
    queryFn: () => fetchOrdersCount(status),
    staleTime: 60_000,
  });
};
