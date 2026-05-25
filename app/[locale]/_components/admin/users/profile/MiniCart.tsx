import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/app/[locale]/_lib/profile";
interface MiniCartProps {
  items: CartItem[];
  locale: string;
}

export function MiniCart({ items, locale }: MiniCartProps) {
  const t = useTranslations("profile" as any);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {t("miniCart.title")}
          </h2>
          <span className="text-sm text-slate-500">{t("miniCart.empty")}</span>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            className="w-16 h-16 text-slate-300 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="text-slate-600">{t("miniCart.noItems")}</p>
          <Link
            href={`/${locale}/products`}
            className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            {t("miniCart.shopNow")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t("miniCart.title")}
          </h2>
          <p className="text-sm text-slate-500">
            {totalItems} {t("miniCart.items")}
          </p>
        </div>
        <Link
          href={`/${locale}/cart`}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          {t("miniCart.viewAll")}
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 text-sm truncate">
                {item.product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">
                  Size: {item.size}
                </span>
                <span className="text-xs text-slate-500">×{item.quantity}</span>
              </div>
              <p className="text-sm font-semibold text-emerald-600 mt-1">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">
            {t("miniCart.subtotal")}
          </span>
          <span className="text-xl font-bold text-slate-900">
            ${totalValue.toFixed(2)}
          </span>
        </div>

        <Link
          href={`/${locale}/cart`}
          className="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {t("miniCart.viewCart")}
        </Link>
      </div>
    </div>
  );
}
