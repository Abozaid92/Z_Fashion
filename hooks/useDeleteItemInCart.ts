import { DeleteOneProductAction } from "@/actions/(Products)/CRUDToCart.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteCartInput } from "@/actions/(Products)/AddProductSchema";
import { CartItemType } from "@/app/[locale]/utils/productType";
import { toast } from "react-toastify";

// التأكد من شكل البيانات القادمة من الكاش
interface typeDatafromServer {
  success: boolean;
  data: CartItemType[];
}

const useDeleteOneProductsFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteCartInput) =>
      DeleteOneProductAction(params),

    onMutate: async (currentId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const prevData = queryClient.getQueryData<typeDatafromServer>(["cart"]);

      queryClient.setQueryData<typeDatafromServer>(["cart"], (old) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.filter(
            (el) =>
              // نحذف فقط إذا تطابق الـ ID والمقاس معاً
              !(
                el.productId === currentId.productId &&
                el.size === currentId.size
              ),
          ),
        };
      });

      return { prevData };
    },

    onError: (err, variables, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(["cart"], context.prevData);
      }
      toast.error("عذراً، فشل حذف المنتج من السلة");
    },
  });
};
const normalFn = async () => {
  return;
};
export const useDeleteOneProductsFromCartPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // تأكد من استدعاء الأكشن الحقيقي للحذف من الداتابيز
    mutationFn: async (params: DeleteCartInput) => normalFn(),

    onMutate: async (currentId) => {
      // 1. إلغاء أي جلب بيانات جاري عشان م يحصلش تضارب
      await queryClient.cancelQueries({ queryKey: ["cartPage"] });

      // 2. أخذ نسخة احتياطية من الكاش القديم (Array)
      const prevData = queryClient.getQueryData<CartItemType[]>(["cartPage"]);

      // 3. التحديث التفاؤلي (حذف المنتج فوراً من الـ UI)
      queryClient.setQueryData<CartItemType[]>(["cartPage"], (old) => {
        if (!old) return [];

        // بنفلتر المصفوفة مباشرة لأن مفيش { data: ... }
        return old.filter(
          (el) =>
            !(
              el.product.id === currentId.productId &&
              el.size === currentId.size
            ),
        );
      });

      // إرجاع النسخة الاحتياطية لاستخدامها في حالة الخطأ
      return { prevData };
    },

    onError: (err, variables, context) => {
      // لو العملية فشلت، نرجع السلة زي ما كانت
      if (context?.prevData) {
        queryClient.setQueryData(["cartPage"], context.prevData);
      }
      toast.error("عذراً، فشل حذف المنتج من السلة");
    },

    onSettled: () => {
      // مزامنة مع السيرفر بعد انتهاء العملية (سواء نجحت أو فشلت)
      queryClient.invalidateQueries({ queryKey: ["cartPage"] });
    },
  });
};

export default useDeleteOneProductsFromCart;
