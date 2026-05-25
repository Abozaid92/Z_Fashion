"use client";
import { useTranslations } from "next-intl";
import React, { useState, useRef } from "react";
import { ShoppingCart, Trash2, ArrowLeft, Ruler, Bell } from "lucide-react";
import useGetItemsInCart from "@/hooks/getItemsInCart";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import useDeleteOneProductsFromCart from "@/hooks/useDeleteItemInCart";
import { Size } from "@prisma/client";
import BellModal from "../bell";

const CartNav = () => {
  const tCart = useTranslations("Cart" as any);
  const tNav = useTranslations("CartNav" as any);
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
    <div className="relative flex gap-8 flex-row-reverse items-center">
      {/* ── Cart Button ─────────────────────────────────────────────── */}
      <div
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-label={`${tCart("shopping_cart")} - ${totalItems} ${tCart("items")}`}
        aria-expanded={isOpen}
        className="relative cursor-pointer p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
      >
        <ShoppingCart className="w-5 h-5 text-slate-700" />
        {totalItems > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-lime-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
            {totalItems}
          </span>
        )}
      </div>

      {/* ── Dropdown ────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label={tCart("shopping_cart")}
          className="absolute right-10 top-full mt-3 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50"
          style={{ animation: "slideDown 0.18s cubic-bezier(0.22,1,0.36,1)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ShoppingCart className="w-4 h-4 text-lime-500" />
              {tCart("shopping_cart")}
            </span>
            <span className="text-xs font-bold text-white bg-lime-500 rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
              {totalItems}
            </span>
          </div>

          {/* Items */}
          <div className="max-h-64 overflow-y-auto overscroll-contain">
            {items.length === 0 ?
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs text-slate-400">{tCart("empty_cart")}</p>
              </div>
            : <ul className="divide-y divide-slate-50">
                {displayedItems.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex gap-3 p-3 hover:bg-slate-50/80 transition-colors duration-150"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                      {item.product.image ?
                        <Image
                          src={item.product.image}
                          alt={item.product.name || "منتج"}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      : <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-slate-300" />
                        </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                      <h4 className="text-xs font-semibold text-slate-700 truncate">
                        {item.product.name || "منتج"}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-lime-600">
                          {Number(item.product.price).toFixed(2)}$
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Ruler className="w-3 h-3" />
                          {item.size}
                          <span className="text-slate-300">·</span>
                          <span>×{item.quantity || 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      aria-label={tCart("remove")}
                      className="shrink-0 self-center w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            }
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-3 py-3 border-t border-slate-100 bg-slate-50/80">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-slate-900 hover:bg-lime-500 text-white text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer"
              >
                {hasMore ?
                  <span>{tNav("view_all", { count: items.length })}</span>
                : <span>{tNav("view_cart")}</span>}
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      <BellModal session={null} />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CartNav;
