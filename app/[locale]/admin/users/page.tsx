// app/admin/users/page.tsx
// ✅ Server Component — Next.js 15

import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import UsersClient from "./UsersClient";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/lib/i18n-utils";
import type { UsersFilters } from "../../utils/AllUserType";

import { getRawUsersFromDb } from "@/app/api/utils/getuserRawsFromDb";
import getQueryClient from "@/lib/getQueryClient";

// ─────────────────────────────────────────────────────────────
const searchParamsCache = createSearchParamsCache({
  userNumber: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(""),
  role: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
});

// ─────────────────────────────────────────────────────────────
interface Props {
  searchParams: Promise<Record<string, string | string[]>>;
}

export default async function UsersPage({
  searchParams,
  params, // المرة الأولى (صحيحة)
}: Props & { params: Promise<{ locale: string }> }) {
  // المرة الثانية: غيرنا الاسم هنا لـ filtersData لتجنب الـ Redeclare
  const filtersData = searchParamsCache.parse(await searchParams);

  const filters: UsersFilters = {
    userNumber: filtersData.userNumber,
    search: filtersData.search,
    role: filtersData.role,
    status: filtersData.status,
  };

  // 3. تجهيز الـ QueryClient
  const queryClient = getQueryClient();

  // 4. جلب البيانات من الداتابيز مباشرة (بدون Fetch/Axios)
  await queryClient.prefetchQuery({
    queryKey: ["users", "list", filters],
    queryFn: () => getRawUsersFromDb(filters),
  });

  // 5. إرسال البيانات للـ Client
  const { locale } = await params; // فك الـ params لضمان التوافق مع Next.js 15

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={pickMessages(await getMessages(), [
        "AdminDataTable",
        "AdminUsers",
        "AdminUpdataStatusModal",
        "AdminUsersFilter",
        "AdminUsersStats",
      ])}
    >
      <UsersClient />
    </NextIntlClientProvider>
  );
}
