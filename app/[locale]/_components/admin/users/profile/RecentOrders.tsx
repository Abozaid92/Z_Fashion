import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Order } from "@prisma/client";

interface RecentOrdersProps {
  orders: Order[];
  locale: string;
}

export function RecentOrders({ orders, locale }: RecentOrdersProps) {
  const t = useTranslations("profile" as any);

  const statusConfig = {
    PENDING_PAYMENT: {
      label: t("orders.status.pendingPayment"),
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: "⏳",
    },
    PROCESSING: {
      label: t("orders.status.processing"),
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: "🔄",
    },
    SHIPPED: {
      label: t("orders.status.shipped"),
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: "📦",
    },
    DELIVERED: {
      label: t("orders.status.delivered"),
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: "✅",
    },
    CANCELLED: {
      label: t("orders.status.cancelled"),
      color: "bg-slate-100 text-slate-800 border-slate-200",
      icon: "❌",
    },
    REFUNDED: {
      label: t("orders.status.refunded"),
      color: "bg-rose-100 text-rose-800 border-rose-200",
      icon: "💰",
    },
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {t("orders.title")}
        </h2>

        <div className="flex flex-col items-center justify-center py-12 text-center">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-slate-600 mb-2">{t("orders.noOrders")}</p>
          <p className="text-sm text-slate-500">{t("orders.startShopping")}</p>
          <Link
            href={`/${locale}/products`}
            className="mt-4 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all"
          >
            {t("orders.shopNow")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t("orders.title")}
          </h2>
          <p className="text-sm text-slate-500">
            {orders.length} {t("orders.recentOrders")}
          </p>
        </div>
        <Link
          href={`/${locale}/orders`}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          {t("orders.viewAll")}
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

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order) => {
          const status = statusConfig[order.status];
          const orderDate = new Date(order.createdAt).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            },
          );

          return (
            <Link
              key={order.id}
              href={`/${locale}/orders/${order.id}`}
              className="block p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-slate-500">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}
                    >
                      {status.icon} {status.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{orderDate}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-slate-900">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium mt-1 group-hover:translate-x-0.5 transition-transform">
                    {t("orders.viewDetails")}
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
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Button (Mobile) */}
      <div className="mt-4">
        <Link
          href={`/${locale}/orders`}
          className="w-full py-2.5 px-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {t("orders.viewAllOrders")}
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
