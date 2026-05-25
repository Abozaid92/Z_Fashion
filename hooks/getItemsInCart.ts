// import { fetchAddProductToCart } from "@/app/[locale]/(departments)/clothes/api";
import { useQuery } from "@tanstack/react-query";
import { GetCartItemsAction } from "@/actions/(Products)/CRUDToCart.action";

const useGetItemsInCart = () => {
  const query = useQuery({
    queryKey: ["cart"],
    queryFn: GetCartItemsAction,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return query;
};

export default useGetItemsInCart;
