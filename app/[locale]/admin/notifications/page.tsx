import type { Metadata } from "next";
import ServerIntl from "@/lib/server-intl";
import NotificationsClient from "./NotificationsClient";

// في نكست 15 الـ Metadata برضه بقت بفضل تكون dynamic لو فيها params
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "ar" ? "التنبيهات | ZFashion" : "Notifications | ZFashion",
    description: "Manage global notifications",
  };
}

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // فك الصندوق هنا عشان نطلع اللغة
  const { locale } = await params;

  const namespaces = [
    "AdminNotifications",
    "AdminNotifComposer",
    "AdminPreviews",
    "NotifRow",
    "NotifFilter",
    "StatsGrid",
    "AdminAnnouncementBarPreview",
    "NotifHistory",
  ];

  return (
    /* بنبعت الـ params زي ما هي (Promise) للـ ServerIntl */
    <ServerIntl namespaces={namespaces} params={params}>
      <NotificationsClient />
    </ServerIntl>
  );
}
