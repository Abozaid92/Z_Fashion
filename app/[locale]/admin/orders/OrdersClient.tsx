// app/admin/orders/OrdersClient.tsx
"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Eye } from "lucide-react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

// ── Your existing components (unchanged) ────────────────────
import {
  DataTable,
  type Column,
} from "../../_components/admin/tables/DataTable";
import { Avatar } from "../../_components/admin/ui/Avatar";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from "../../_lib/utils";

// ── New modals ───────────────────────────────────────────────
import ViewItemsModal from "../../_components/admin/orders/ViewItemsModal";
import UpdateStatusModal, {
  getStatusBadge,
  STATUS_CONFIG,
} from "../../_components/admin/orders/UpdateStatusModal";
// ── Types ────────────────────────────────────────────────────
import type { Order, OrderItem } from "./page";
import Status from "../../_components/admin/orders/Status";
import { useUpdateOrder } from "@/hooks/useupdateOrderStatusAndStats";
import StatusFilter from "../../_components/admin/orders/StatusFilter";

// ─────────────────────────────────────────────────────────────
// API  — axios calls
// ─────────────────────────────────────────────────────────────
const fetchOrders = async (page: number, status: string): Promise<Order[]> => {
  const { data } = await axios.get<Order[]>(
    `/api/products/order?orderNumber=${page}&status=${status}`,
  );
  return data;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
interface Props {
  currentPage: number;
}

export default function OrdersClient({ currentPage }: Props) {
  const t = useTranslations("AdminStatus.statuses" as any);
  const r = useTranslations("AdminOrders" as any);
  // ── Modal state ─────────────────────────────────────────────
  const [viewItems, setViewItems] = useState<OrderItem[] | null>(null);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);

  // ── Query (data hydrated from server on first paint) ─────────

  const [page] = useQueryState("orderNumber", parseAsInteger.withDefault(1));
  const [status] = useQueryState("status", parseAsString.withDefault(""));
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: ["orders", +page, status],
    queryFn: () => fetchOrders(currentPage, status),
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ── Mutation + Optimistic update ─────────────────────────────
  const { mutate: updateStatus, isPending } = useUpdateOrder(
    +page,
    setStatusOrder,
    status,
  );
  const confirmedRevenue = useMemo(
    () =>
      orders
        .filter((o) => !["CANCELLED"].includes(o.status))
        .reduce((s, o) => s + o.totalAmount, 0),
    [orders],
  );

  // ── Columns (memoized) ───────────────────────────────────────
  const columns = useMemo<Column<Order>[]>(
    () => [
      // Order ID
      {
        key: "id",
        header: "Order",
        sortable: false,
        cell: (row) => (
          <span className="font-mono text-xs font-semibold text-slate-500">
            #{row.id.slice(0, 8).toUpperCase()}
          </span>
        ),
      },

      // Customer
      {
        key: "user",
        header: "Customer",
        sortable: false,
        width: "min-w-[180px]",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={row.user.image ?? undefined}
              name={row.user.name ?? "?"}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {row.user.name ?? "—"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {row.user.email ?? "—"}
              </p>
            </div>
          </div>
        ),
      },

      // Status — clickable badge
      {
        key: "status",
        header: "Status",
        sortable: true,
        cell: (row) => (
          <button
            onClick={() => setStatusOrder(row)}
            title="Click to update status"
            className={`
              inline-flex items-center gap-1.5 rounded-full border
              px-2.5 py-0.5 text-xs font-semibold select-none
              transition-all hover:scale-105 hover:shadow-sm cursor-pointer
              ${getStatusBadge(row.status)}
            `}
          >
            <span className="size-1.5 rounded-full bg-current opacity-60" />
            {t(STATUS_CONFIG[row.status]?.label ?? row.status)}
          </button>
        ),
      },

      // Items — "View" button  (hidden on mobile)
      {
        key: "orderItems",
        header: "Items",
        hideBelow: "sm",
        cell: (row) => (
          <button
            onClick={() => setViewItems(row.orderItems)}
            className="
              inline-flex items-center gap-1.5 rounded-lg border border-slate-200
              bg-white px-2.5 py-1 text-xs font-medium text-slate-500
              hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700
              transition-colors
            "
          >
            <Eye size={11} />
            {t("View")} ({row.orderItems.length})
          </button>
        ),
      },

      // Total
      {
        key: "totalAmount",
        header: "Total",
        sortable: true,
        align: "right",
        cell: (row) => (
          <span className="font-mono text-sm font-semibold text-slate-800 tabular-nums">
            {formatCurrency(row.totalAmount)}
          </span>
        ),
      },

      // Date  (hidden on mobile)
      {
        key: "createdAt",
        header: "Date",
        sortable: true,
        hideBelow: "md",
        cell: (row) => (
          <div>
            <time className="text-xs text-slate-700 block">
              {formatDate(new Date(row.createdAt) as any)}
            </time>
            <span className="text-[11px] text-slate-400">
              {formatRelativeTime(String(row.createdAt))}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  // ── Error state ──────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-sm text-red-500">
        ⚠ Failed to load orders. Please refresh.
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            {r("Orders")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ?
              "Loading orders…"
            : `${orders.length} ${r("Orders")} · ${formatCurrency(confirmedRevenue)} ${r("confirmed_revenue")}`
            }
          </p>
        </div>
      </div>

      {/* ── Status breakdown ─────────────────────────────────── */}
      <Status />
      {/* ── Data Table ───────────────────────────────────────── */}
      <DataTable
        data={orders as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKeys={["id"] as any}
        searchPlaceholder="Search by order ID…"
        pageSize={10}
        caption="Orders table"
        emptyMessage={isLoading ? "Loading…" : "No orders found."}
        toolbar={<StatusFilter />}
        paginationType="Order" // defult
      />

      {/* ── Pagination ───────────────────────────────────────── */}

      {/* ── Modals ───────────────────────────────────────────── */}
      <ViewItemsModal
        items={viewItems as any}
        onClose={() => setViewItems(null)}
      />
      <UpdateStatusModal
        order={statusOrder as any}
        onClose={() => {
          setStatusOrder(null);
        }}
        onConfirm={(orderId, status) => updateStatus({ orderId, status })}
        isPending={isPending}
      />
    </div>
  );
}
