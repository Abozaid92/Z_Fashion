"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ShoppingBag, Heart, Plus, Minus, Share2, Check } from "lucide-react";
import { cn } from "../../_lib/utils";
import useAddToProductsToCart from "@/hooks/useAddToCart";
import { handleShare } from "@/lib/fnConstants";

interface ProductActionsProps {
  productId: string;
  productName: string;
  productImage?: string; // ضفنا دي عشان الشير يشوف الصورة
  selectedSize: string;
  onSizeError: () => void;
}

export default function ProductDiffrentActions({
  productId,
  productName,
  productImage,
  selectedSize,
  onSizeError,
}: ProductActionsProps) {
  const t: any = useTranslations();
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // حالة الشير عشان ندي Feedback للمستخدم
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  const { mutate, isPending } = useAddToProductsToCart();

  const onShare = async () => {
    const result = await handleShare({
      title: productName,
      url: window.location.href,
      text: `Check out this ${productName} on our store!`,
      imageUrl: productImage,
    });

    if (result !== "failed") {
      setStatus(result);
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!selectedSize) {
      onSizeError();
      return;
    }

    mutate(
      {
        productId,
        quantity,
        size: selectedSize as any,
      },
      {
        onSuccess: () => {
          setAddedToCart(true);
          setTimeout(() => setAddedToCart(false), 2000);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <p className="text-[12px] font-semibold text-stone-600">
          {t("ProductActions.quantity")}
        </p>
        <div className="flex items-center rounded-lg border border-stone-200 p-1">
          <button
            onClick={handleDecrement}
            className="flex size-8 items-center justify-center rounded-md hover:bg-stone-100 active:scale-90 transition-all"
            type="button"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-[14px] font-medium tabular-nums">
            {quantity}
          </span>
          <button
            onClick={handleIncrement}
            className="flex size-8 items-center justify-center rounded-md hover:bg-stone-100 active:scale-90 transition-all"
            type="button"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isPending}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold tracking-wide text-white transition-all",
            addedToCart ? "bg-green-600" : (
              "bg-stone-900 hover:bg-stone-800 active:scale-[.98]"
            ),
            isPending && "opacity-70 cursor-not-allowed",
          )}
        >
          <ShoppingBag size={16} />
          {isPending ?
            t("ProductActions.adding")
          : addedToCart ?
            t("ProductActions.added")
          : t("ProductActions.add_to_cart")}
        </button>

        {/* <button
          type="button"
          onClick={() => setWishlisted((w) => !w)}
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl border transition-all",
            wishlisted ?
              "border-red-200 bg-red-50 text-red-500"
            : "border-stone-200 text-stone-500 hover:border-stone-300",
          )}
        >
          <Heart size={17} fill={wishlisted ? "currentColor" : "none"} />
        </button> */}

        <button
          type="button"
          onClick={onShare}
          aria-label={t("ProductActions.share_aria")}
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
            status === "copied" ?
              "border-green-500 bg-green-50 text-green-600"
            : "border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700",
          )}
        >
          {status === "copied" ?
            <Check size={16} />
          : <Share2 size={15} />}
        </button>
      </div>
    </div>
  );
}
