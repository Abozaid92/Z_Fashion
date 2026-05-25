import { updateQuantityAction } from "@/actions/(Products)/CRUDToCart.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartItemType } from "@/app/[locale]/utils/productType";
import { toast } from "react-toastify";

interface typeDatafromServer {
  success: boolean;
  data: CartItemType[];
}

const useUpdateQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { productId: string; size: any; quantity: number }) =>
      updateQuantityAction(params),

    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const prevData = queryClient.getQueryData<typeDatafromServer>(["cart"]);

      queryClient.setQueryData<typeDatafromServer>(["cart"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item) =>
            (
              item.productId === updatedItem.productId &&
              item.size === updatedItem.size
            ) ?
              { ...item, quantity: updatedItem.quantity }
            : item,
          ),
        };
      });

      return { prevData };
    },

    onError: (err, variables, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(["cart"], context.prevData);
      }
      toast.error("فشل تحديث الكمية، حاول مرة أخرى");
    },
  });
};

const normalFn = async () => {
  return true;
};
export const useUpdateQuantityPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { productId: string; size: any; quantity: number }) =>
      normalFn(), // استخدم الأكشن الحقيقي هنا بردو

    onMutate: async (updatedItem) => {
      // 1. نوقف أي ريفيتش شغال عشان ميبوظش الـ Optimistic Update
      await queryClient.cancelQueries({ queryKey: ["cartPage"] });

      // 2. ناخد لقطة من الكاش القديم (اللي هو دلوقتي Array)
      const prevData = queryClient.getQueryData<CartItemType[]>(["cartPage"]);

      // 3. نحدث الكاش تفاؤلياً (Optimistically)
      queryClient.setQueryData<CartItemType[]>(["cartPage"], (old) => {
        if (!old) return [];

        // هنا بنعمل map على المصفوفة مباشرة لأن مفيش { data: ... }
        return old.map((item) =>
          (
            item.product.id === updatedItem.productId &&
            item.size === updatedItem.size
          ) ?
            { ...item, quantity: updatedItem.quantity }
          : item,
        );
      });

      return { prevData };
    },

    onError: (err, variables, context) => {
      // لو حصل مشكلة نرجع الداتا القديمة
      if (context?.prevData) {
        queryClient.setQueryData(["cartPage"], context.prevData);
      }
      toast.error("فشل تحديث الكمية");
    },

    onSettled: () => {
      // نأكد مزامنة الداتا مع السيرفر بعد ما نخلص
    },
  });
};

export default useUpdateQuantity;
