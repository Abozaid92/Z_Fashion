import type { Metadata } from "next";
import { SupportClient } from "./SupportClient";
import ServerIntl from "@/lib/server-intl";

// ─────────────────────────────────────────────────────────────────────────────
// Support Page — Server Component
// Prisma swap: const tickets = await prisma.supportTicket.findMany({
//   include: { user: true, messages: { orderBy: { timestamp: "asc" } } },
//   orderBy: { lastMessageAt: "desc" },
// })
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Support",
  description: "Manage customer support conversations",
};

export default function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Pass pre-fetched tickets to the client component
  const namespaces = [
    "AdminSupport",
    "AdminDeleteDialog",
    "AdminModal",
    "AdminButton",
  ];
  return (
    <ServerIntl namespaces={namespaces} params={params}>
      <SupportClient />
    </ServerIntl>
  );
}
