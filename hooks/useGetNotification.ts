import { fetchNotification } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import { useQuery } from "@tanstack/react-query";

const useGetNotification = (userId: string) => {
  const query = useQuery({
    queryKey: ["bells", userId],
    queryFn: () => fetchNotification(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 1000,
    enabled: !!userId,
  });
  return query;
};

export default useGetNotification;
