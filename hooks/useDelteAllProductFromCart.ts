import { DeleteAllProductAction } from "@/actions/(Products)/CRUDToCart.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteOneProductsFromCart = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => DeleteAllProductAction(),
    // success or failed refresh
    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
  return mutation;
};

export default useDeleteOneProductsFromCart;
