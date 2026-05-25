import { OrderStatus } from "@prisma/client";

export interface OrderStatusDetails {
  status: OrderStatus;
  _count: {
    status: number;
  };
}

export type OrderStatusResponse = OrderStatusDetails[];

export const STATUS_SUMMARY = [
  {
    label: "Pending",
    status: "PENDING",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Processing",
    status: "PROCESSING",
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    label: "Shipped",
    status: "SHIPPED",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "Delivered",
    status: "DELIVERED",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Cancelled",
    status: "CANCELLED",
    color: "text-slate-500",
    bg: "bg-red-100",
  },
] as const;
