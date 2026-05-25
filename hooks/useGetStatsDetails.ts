import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DOMAIN } from "@/lib/constants";
import { OrderStatusDetails } from "@/app/[locale]/utils/stats_Type";

const fetchStatusData = async (): Promise<OrderStatusDetails[]> => {
  const { data } = await axios.get(`${DOMAIN}/api/products/order/stats`);
  return data;
};

export const useOrderStatusStats = () => {
  return useQuery({
    queryKey: ["order-stats"],
    queryFn: fetchStatusData,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
