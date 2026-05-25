import { useTranslations } from "next-intl";
import { Tag, Trash2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import type { CartItemType } from "@/app/[locale]/utils/productType";
import { useQueryClient } from "@tanstack/react-query";
import useDeleteOneProductsFromCart, {
  useDeleteOneProductsFromCartPage,
} from "@/hooks/useDeleteItemInCart";
import { Size } from "@prisma/client";
import useUpdateQuantity, {
  useUpdateQuantityPage,
} from "@/hooks/useUpdateQuantity";

interface typeprops {
  item: CartItemType;
  index: number;
}

interface typeOldFromCash {
  success: boolean;
  data: CartItemType[];
}

const CartItem = ({ item, index }: typeprops) => {
  const queryClient = useQueryClient();
  const { mutate } = useDeleteOneProductsFromCart();
  const { mutate: mutatePage } = useDeleteOneProductsFromCartPage();
  const { mutate: updateQty } = useUpdateQuantity();
  const { mutate: updateQtyPage } = useUpdateQuantityPage();
  const t = useTranslations("CartItem" as any);

  function removeItem(productId: string, size: Size): void {
    // console.log(size);
    mutate({ productId, size });
    mutatePage({ productId, size });
  }

  function updateQuantity(
    productId: string,
    size: Size,
    newQuantity: number,
  ): void {
    if (newQuantity < 1) return;
    updateQty({ productId, size, quantity: newQuantity });
    updateQtyPage({ productId, size, quantity: newQuantity });
  }

  const total = (
    (+item.product.price -
      (+item.product.price * (item.product.discount || 0)) / 100) *
    item.quantity
  ).toFixed(2);

  return (
    <article
      key={item.product.id + item.product.size}
      className="group relative bg-white rounded-3xl border border-slate-100 hover:border-lime-200 hover:shadow-[0_8px_40px_-12px_rgba(132,204,22,0.18)] transition-all duration-500 overflow-hidden"
    >
      {/* Subtle top accent line on hover */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-lime-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-5 sm:p-6 flex gap-5 sm:gap-6">
        {/* ── Product Image ───────────────────────────────────────── */}
        <div className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-50">
          <Image
            src={item.product.image}
            alt={item.product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {item.product.discount && item.product.discount > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <Tag className="w-2.5 h-2.5" />
              {item.product.discount}%
            </div>
          )}
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
          {/* Name row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 leading-snug line-clamp-2 tracking-tight">
              {item.product.name}
            </h3>
            <button
              type="button"
              onClick={() => removeItem(item.product.id, item.size)}
              aria-label={t("delete_aria", { product: item.product.name })}
              className="flex-shrink-0 p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Price + Quantity row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Price block */}
            <div className="flex flex-col">
              {item.product.discount && item.product.discount > 0 ?
                <>
                  <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-lime-500 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                    {(
                      +item.product.price -
                      (+item.product.price * +item.product.discount) / 100
                    ).toFixed(2)}
                    $
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {(+item.product.price).toFixed(2)}$
                  </span>
                </>
              : <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-lime-500 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                  {(+item.product.price).toFixed(2)}$
                </span>
              }
            </div>

            {/* Quantity stepper */}
            <div
              role="group"
              aria-label={t("quantity_aria")}
              className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  updateQuantity(item.product.id, item.size, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
                aria-label={t("decrease_qty")}
                className={`w-9 h-9 flex items-center justify-center transition-all duration-200 ${
                  item.quantity <= 1 ?
                    "text-slate-300 cursor-not-allowed"
                  : "text-slate-600 hover:bg-lime-500 hover:text-white cursor-pointer"
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-10 text-center text-sm font-bold text-slate-800 select-none">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  updateQuantity(item.product.id, item.size, item.quantity + 1)
                }
                aria-label={t("increase_qty")}
                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-lime-500 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Line total */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400 tracking-wide uppercase">
              {t("total_label")}
            </span>
            <span className="text-sm font-bold text-slate-700">{total}$</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
