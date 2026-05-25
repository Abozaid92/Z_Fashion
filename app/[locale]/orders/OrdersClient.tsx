"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  GetOrdersAction,
  CancelOrderAction,
} from "@/actions/(order)/CRUDTOORDER.action";
import { toast } from "sonner";
import { Package, Calendar, CreditCard, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing"; // ✅ FIX

async function fetchOrders() {
  const result = await GetOrdersAction();
  if (!result.success) {
    return [];
  }
  return result.data;
}

const statusColors = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

// statusText will be derived from translations inside the component (so hooks can be used)

export default function OrdersClient() {
  const t = useTranslations("Orders" as any);
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const statusText = {
    PENDING_PAYMENT: t("status.pending_payment"),
    PROCESSING: t("status.processing"),
    SHIPPED: t("status.shipped"),
    DELIVERED: t("status.delivered"),
    CANCELLED: t("status.cancelled"),
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      setCancellingId(orderId);
      const result = await CancelOrderAction(orderId);
      if (!result.success) {
        throw new Error(result.message as string);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(t("cancel.success"));
      setCancellingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("cancel.error"));
      setCancellingId(null);
    },
  });

  const initialData = orders || [];

  const canCancelOrder = (status: string) => {
    return status === "PENDING_PAYMENT" || status === "PROCESSING"; // ✅ FIX
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-lime-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-lime-500/30">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t("title")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {initialData.length} {t("orders")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Empty */}
        {initialData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {t("empty_title")}
            </h2>
            <p className="text-slate-500 mb-6">{t("empty_subtitle")}</p>

            <Link
              href="/"
              className="px-6 py-3 bg-lime-600 text-white rounded-xl hover:bg-lime-700 transition-colors"
            >
              {t("browse_products")}
            </Link>
          </div>
        )}

        {/* Orders */}
        {initialData.length > 0 && (
          <div className="space-y-6">
            {initialData.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          {t("labels.order_number")}
                        </p>
                        <p className="font-mono text-sm font-semibold text-slate-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>

                      <div className="h-10 w-px bg-slate-200" />

                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t("labels.date")}
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="h-10 w-px bg-slate-200" />

                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {t("labels.total")}
                        </p>
                        <p className="text-sm font-bold text-lime-700">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          statusColors[
                            order.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {statusText[order.status as keyof typeof statusText]}
                      </span>

                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => cancelMutation.mutate(order.id)}
                          disabled={cancellingId === order.id}
                          className="px-4 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {cancellingId === order.id ?
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {t("cancel.loading")}
                            </>
                          : <>
                              <X className="w-3 h-3" />
                              {t("cancel.button")}
                            </>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-5 sm:p-6">
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 border border-slate-100"
                      >
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                          <Image
                            src={item.product.image} // ✅ FIX
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate mb-1">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <span>الكمية: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between pt-3">
                      <span className="font-semibold text-slate-900">
                        الإجمالي
                      </span>
                      <span className="text-lg font-bold text-lime-700">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
