import { GetOrdersAction } from "@/actions/(order)/CRUDTOORDER.action";
import OrdersClient from "./OrdersClient";
import ServerIntl from "@/lib/server-intl";
import getQueryClient from "@/lib/getQueryClient";

export const metadata = {
  title: "My Orders - ZFashion",
  description: "Track and manage your orders",
};

async function getOrders() {
  const result = await GetOrdersAction();
  if (!result.success) {
    return [];
  }
  return result.data;
}

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const queryClient = getQueryClient();

  // Prefetch orders data on the server
  await queryClient.prefetchQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const namespaces = ["Orders"];

  return (
    <ServerIntl namespaces={namespaces} params={params}>
      <OrdersClient />
    </ServerIntl>
  );
}
