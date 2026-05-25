import CartClient from "@/components/cart/Cart";
import ServerIntl from "@/lib/server-intl";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import getQueryClient from "@/lib/getQueryClient";
export const metadata = {
  title: "Shopping Cart - ZFashion",
  description: "Review your cart items",
};

// دالة مشتركة في ملف خارجي أو نفس الملف (بدون fetch)
async function getCartFromDB() {
  const session = await auth();
  const userId = session?.user?.id;
  return await prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          price: true,
          image: true,
        },
      },
    },
  });
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const queryClient = getQueryClient();

  // Prefetch cart data on the server
  await queryClient.prefetchQuery({
    queryKey: ["cartPage"],
    queryFn: getCartFromDB,
  });

  const namespaces = ["Cart", "EmptyCart", "CartItem", "Applyrequest"];

  return (
    <ServerIntl namespaces={namespaces} params={params}>
      <CartClient />
    </ServerIntl>
  );
}
