import { fetchProducts, productKeys } from "@/hooks/use-products-query";
import { fetchCategories, categoryKeys } from "@/hooks/use-categories-query";
import { ProductsClient } from "./products-client";
import { DOMAIN } from "@/lib/constants";
import ServerIntl from "@/lib/server-intl";
import getQueryClient from "@/lib/getQueryClient";

export const metadata = {
  title: "Products | Admin Dashboard",
};

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const queryClient = getQueryClient();

  const defaultFilters = { pageNumber: 1 };

  // Prefetch products and categories in parallel on the server
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: productKeys.list(defaultFilters),
      queryFn: () => fetchProducts(defaultFilters),
    }),
    queryClient.prefetchQuery({
      queryKey: categoryKeys.list(),
      queryFn: () => fetchCategories(DOMAIN),
    }),
  ]);

  const namespaces = [
    "AdminProductBasicInfo",
    "AdminProductPricing",
    "AdminGalleryUpload",
    "AdminImageUpload",
    "AdminDeleteDialog",
    "AdminDataTable",
    "AdminProducts",
    "AdminProductForm",
    "AdminButton",
    "AdminModal",
  ];

  return (
    <ServerIntl namespaces={namespaces} params={params}>
      <ProductsClient />
    </ServerIntl>
  );
}
