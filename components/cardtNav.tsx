"use client";
import { useTranslations } from "next-intl";
import React, { useState, useRef } from "react";
import { ShoppingCart, Trash2, ArrowLeft, Ruler, Bell } from "lucide-react";
import useGetItemsInCart from "@/hooks/getItemsInCart";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import useDeleteOneProductsFromCart from "@/hooks/useDeleteItemInCart";
import { Size } from "@prisma/client";
const CartNav = () => {
  const t = useTranslations("CartNav" as any);
  const { data } = useGetItemsInCart();
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { mutate, error, isError } = useDeleteOneProductsFromCart();

  function removeItem(productId: string, size: Size) {
    // console.log(productId);
    mutate({ productId, size });
    // console.log("error====================");
    // console.log(error);
  }

  const items = data?.data || [];
  const totalItems = items.length;

  const displayedItems = items.slice(-3).reverse();

  const hasMore = items.length > 3;

  return (
    <div className="relative flex gap-10 flex-row-reverse">
      {/* الزر */}
      <div
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer"
      >
        <ShoppingCart className="text-xl text-green-700" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-12 mt-14 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-lime-100 overflow-hidden z-50 sm
          -mr-36 md:-mr-8"
          style={{
            animation: "slideDown 0.2s ease-out",
          }}
        >
          {/* Header صغير */}
          <div className="bg-gradient-to-r from-lime-50 to-emerald-50 px-3 py-2 border-b border-lime-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4" />
                {t("cart_label")}
              </span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {totalItems}
              </span>
            </div>
          </div>

          {/* المنتجات */}
          <div className="max-h-64 overflow-y-auto">
            {
              items.length === 0 ?
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <div className="w-12 h-12 bg-lime-50 rounded-full flex items-center justify-center mb-2">
                    <ShoppingCart className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-500">{t("empty_cart")}</p>
                </div>
                // المنتجات - صغيرة
              : <div className="divide-y divide-gray-50">
                  {displayedItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-2 p-2 hover:bg-lime-50/30 transition-colors"
                    >
                      {/* صورة صغيرة */}
                      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-lime-50 to-emerald-50">
                        {item.product.image ?
                          <Image
                            src={item.product.image}
                            alt={item.product.name || t("product_label")}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        : <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-green-300" />
                          </div>
                        }
                      </div>

                      {/* التفاصيل */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-gray-800 truncate">
                          {item.product.name || t("product_label")}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-lime-700">
                            {Number(item.product.price).toFixed(2)}$
                            <div className="flex gap-0.5 items-center w-10   text-gray-400 h-4">
                              <Ruler />
                              {item.size}
                            </div>
                          </span>
                          <span className="text-xs text-gray-400">
                            × {item.quantity || 1}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="flex-shrink-0 cursor-pointer w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

            }
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-lime-50 to-emerald-50 px-3 py-2 border-t border-lime-100">
              {/* الزر */}
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-gradient-to-r from-green-200 to-emerald-200 hover:from-green-300 hover:to-emerald-300 text-black/55 text-xs font-medium rounded-lg transition-all"
              >
                {hasMore ?
                  <>
                    <span>
                      {t("view_cart")} ({items.length})
                    </span>
                    <ArrowLeft className="w-3 h-3" />
                  </>
                : <>
                    <span>{t("view_cart")}</span>
                    <ArrowLeft className="w-3 h-3" />
                  </>
                }
              </Link>
            </div>
          )}
        </div>
      )}

      {/* CSS */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CartNav;
