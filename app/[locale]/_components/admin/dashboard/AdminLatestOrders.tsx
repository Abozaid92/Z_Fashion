"use client";

import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { useTranslations } from "next-intl";

// Fetch function
async function fetchDashboardData() {
  const response = await fetch("/api/admin/dashboard");
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
}

const RecentOrdersTable = memo(({ orders }: { orders: any[] }) => {
  const t = useTranslations("AdminLatestOrders" as any);
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
      PROCESSING: "bg-blue-100 text-blue-700",
      SHIPPED: "bg-purple-100 text-purple-700",
      DELIVERED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
      REFUNDED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order ID
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-gray-900">
                    #{order.id.slice(0, 8)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                      {order.user.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {order.user.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {t?.(`status_${order.status.toLowerCase()}`) ||
                      order.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

RecentOrdersTable.displayName = "RecentOrdersTable";

export default function AdminLatestOrders() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 h-96 animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  return <RecentOrdersTable orders={data.recentOrders} />;
}
