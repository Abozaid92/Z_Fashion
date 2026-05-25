import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AdminUserContent } from "./AdminUserContent";
import ProfileSkeleton from "@/app/[locale]/utils/ProfileSkeleton";
import { DOMAIN } from "@/lib/constants";
import { QueryClient } from "@tanstack/react-query";
import getQueryClient from "@/lib/getQueryClient";

export const metadata = {
  title: "User Profile - Admin View",
  description: "View and manage user account",
};

async function prefetchUserData(queryClient: QueryClient, userId: string) {
  await queryClient.prefetchQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const res = await fetch(`${DOMAIN}/api/users/${userId}`, {
        next: { revalidate: 60 },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json();
    },
  });
}

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  // const session = await auth();

  // Only admins can access
  // if (!session?.user?.id || session.user.role !== "ADMIN") {
  //   redirect(`/${locale}/profile`);
  // }

  const t = await getTranslations("profile");
  const queryClient = getQueryClient();

  // Prefetch user data
  await prefetchUserData(queryClient, id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <a
            href={`/${locale}/admin/users`}
            className="hover:text-emerald-600 transition-colors"
          >
            Users
          </a>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-slate-900 font-medium">User Profile</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              {t("admin.pageTitle")}
            </h1>
            <p className="text-slate-600">{t("admin.pageDescription")}</p>
          </div>
        </div>

        {/* Hydrated Content */}
        <Suspense fallback={<ProfileSkeleton />}>
          <AdminUserContent locale={locale} userId={id} />
        </Suspense>
      </div>
    </div>
  );
}
