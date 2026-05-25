"use client";

import { fetchAddProductToCart } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Size } from "@prisma/client";
import { toast } from "react-toastify"; // لو بتستخدمها للـ Feedback

interface typeData {
  productId: string;
  quantity: number;
  size: Size;
}

const useAddToProductsToCart = () => {
  const queryClient = useQueryClient(); // ✅ لازم يكون جوه الهوك هنا

  return useMutation({
    mutationFn: async ({ productId, quantity, size }: typeData) =>
      fetchAddProductToCart(productId, quantity, size),

    // الاختياري: التحديث التفاؤلي (Optimistic Update)
    onMutate: async (newData) => {
      // 1. نوقف أي تحديثات جارية عشان ما يحصلش تعارض
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // 2. ناخد نسخة من البيانات القديمة (عشان لو فشلنا نرجع لها)
      const previousCart = queryClient.getQueryData(["cart"]);

      // 3. (اختياري) نحدث الـ UI فوراً هنا لو حابب تظهر الـ loading أو زيادة الرقم

      return { previousCart };
    },

    onSuccess: () => {
      // تحديث البيانات في الخلفية فوراً بعد النجاح
      // queryClient.invalidateQueries({ queryKey: ["cart"] });
      // toast.success("Added to cart! ⚡", {
      //   position: "bottom-right",
      //   autoClose: 2000,
      // });
    },

    onError: (err, newData, context) => {
      // لو حصل مشكلة، نرجع البيانات القديمة
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error("Failed to add to cart. Please try again.");
    },
  });
};

export default useAddToProductsToCart;
