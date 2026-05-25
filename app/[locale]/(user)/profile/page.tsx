import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ProfileContent } from "./ProfileContent";
// import { ProfileSkeleton } from "./ProfileSkeleton";
import { DOMAIN } from "@/lib/constants";
import ServerIntl from "@/lib/server-intl";
import getQueryClient from "@/lib/getQueryClient";
import { QueryClient } from "@tanstack/react-query";

export const metadata = {
  title: "My Profile",
  description: "View and manage your account information",
};

async function prefetchProfileData(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ["user-profile", "me"],
    queryFn: async () => {
      const res = await fetch(`${DOMAIN}/api/users/profile`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("profile");
  const queryClient = getQueryClient();

  // Prefetch data on server
  await prefetchProfileData(queryClient);
  const namespaces = ["profile"];
  return (
    <ServerIntl namespaces={namespaces} params={params}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              {t("pageTitle")}
            </h1>
            <p className="text-slate-600">{t("pageDescription")}</p>
          </div>

          {/* Hydrated Content */}
          <Suspense fallback={null}>
            <ProfileContent locale={locale} role={session.user.role} />
          </Suspense>
        </div>
      </div>
    </ServerIntl>
  );
}
