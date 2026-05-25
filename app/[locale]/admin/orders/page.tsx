import prisma from "@/lib/db";
import { orderPerPage } from "@/lib/constants";
import OrdersClient from "./OrdersClient";
import ServerIntl from "@/lib/server-intl";
import { OrderStatus } from "@prisma/client";
import getQueryClient from "@/lib/getQueryClient";

// ─────────────────────────────────────────────────────────────
// Shared Types  (exported → used in client + modals)
// ─────────────────────────────────────────────────────────────
export type OrderItem = {
  quantity: number;
  price: number;
  product: { name: string };
};

export type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  user: {
    image: string | null;
    name: string | null;
    email: string | null;
  };
  orderItems: OrderItem[];
};

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
interface Props {
  searchParams: Promise<{ orderNumber?: string; status: OrderStatus }>;
}

export default async function OrdersPage({
  searchParams,
  params,
}: Props & { params: Promise<{ locale: string }> }) {
  const resolved = await searchParams;
  const page = Math.max(1, Number(resolved.orderNumber) || 1);
  const status = resolved.status || "";

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["orders", page, status],
    queryFn: async () => {
      const whereCondition = status ? { status } : {};
      const orders = await prisma.order.findMany({
        where: whereCondition,
        skip: (page - 1) * orderPerPage,
        take: orderPerPage,
        include: { user: true, orderItems: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      });
      return JSON.parse(JSON.stringify(orders));
    },
  });

  return (
    <ServerIntl
      params={params}
      namespaces={[
        "AdminOrders",
        "AdminStatus",
        "AdminDataTable",
        "AdminViewItemsModal",
        "AdminUpdateStatusModal",
        "AdminStatusFilter",
      ]}
    >
      <OrdersClient currentPage={page} />
    </ServerIntl>
  );
}
// app/admin/orders/page.tsx
// ✅ Server Component — Next.js 15
