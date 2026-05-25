// app/charts/orders/page.tsx
import { Suspense } from "react";

import { AnalyticType } from "@prisma/client";
import {
  getAnalytics,
  getPreviousPeriodData,
} from "@/app/[locale]/_lib/analytics-queries";
import { OrdersContent } from "./orders-content";
import getQueryClient from "@/lib/getQueryClient";

interface PageProps {
  // ضيف دي هنا عشان الـ TypeScript يسكت ✅
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    timeframe?: "7days" | "30days" | "90days" | "thisYear" | "custom";
    from?: string;
    to?: string;
  }>;
}

// ضيف params هنا في الـ Arguments حتى لو مش هتلمسها
export default async function OrdersPage({ params, searchParams }: PageProps) {
  // فك الـ searchParams (زي ما أنت عامل صح)
  const sParams = await searchParams;
  const timeframe = sParams.timeframe || "30days";

  // فك الـ params برضه عشان الـ Build يعدي بسلام
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["analytics", "ORDERS", timeframe],
      queryFn: () =>
        getAnalytics({
          type: AnalyticType.ORDERS,
          timeframe,
          from: sParams.from,
          to: sParams.to,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "ORDERS", "previous", timeframe],
      queryFn: () =>
        getPreviousPeriodData({
          type: AnalyticType.ORDERS,
          timeframe,
          from: sParams.from,
          to: sParams.to,
        }),
    }),
  ]);

  return (
    <Suspense fallback={<LoadingState />}>
      <OrdersContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-slate-200 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Order Analytics | Dashboard",
  description: "Comprehensive order analytics and insights",
};
