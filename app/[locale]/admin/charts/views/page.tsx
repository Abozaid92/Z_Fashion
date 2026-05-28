// app/charts/views/page.tsx
import { Suspense } from "react";
import { ViewsContent } from "./views-content";
import getQueryClient from "@/lib/getQueryClient";

async function getViewAnalytics() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/analytics/views`,
    {
      cache: "no-store",
    },
  );
  return response.json();
}

export default async function ViewsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["analytics", "views"],
    queryFn: getViewAnalytics,
  });

  return (
    <Suspense fallback={<LoadingState />}>
      <ViewsContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-slate-200 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "View Analytics | Dashboard",
  description: "Track page views and visitor traffic",
};
