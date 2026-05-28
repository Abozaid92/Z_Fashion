// app/charts/products/page.tsx
import { Suspense } from "react";

import { ProductsContent } from "./products-content";
import getQueryClient from "@/lib/getQueryClient";

async function getProductAnalytics() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/analytics/products`,
    { cache: "no-store" },
  );
  return response.json();
}

export default async function ProductsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["analytics", "products"],
    queryFn: getProductAnalytics,
  });

  return (
    <Suspense fallback={<LoadingState />}>
      <ProductsContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-slate-200 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-slate-200 rounded-2xl"></div>
            <div className="h-96 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Product Analytics | Dashboard",
  description: "Deep-dive product performance and conversion analytics",
};
