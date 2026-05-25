import { fetchCategories, categoryKeys } from "@/hooks/use-categories-query";
import { CategoriesClient } from "./categories-client";
import ServerIntl from "@/lib/server-intl";
import { DOMAIN } from "@/lib/constants";
import getQueryClient from "@/lib/getQueryClient";

export const metadata = {
  title: "Categories | Admin Dashboard",
};

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => fetchCategories(DOMAIN ?? "http://localhost:3000"),
  });

  const namespaces = [
    "AdminCategories",
    "AdminDeleteDialog",
    "AdminModal",
    "AdminButton",
  ];

  return (
    <ServerIntl namespaces={namespaces} params={params}>
      <CategoriesClient />
    </ServerIntl>
  );
}
