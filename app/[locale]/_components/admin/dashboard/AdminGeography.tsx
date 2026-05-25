"use client";

import { lazy, Suspense } from "react";

const GeographyMap = lazy(() => import("./GeographyMap"));

export default function AdminGeography() {
  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Global Reach</h3>
      <Suspense
        fallback={
          <div className="w-full h-[500px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <p className="text-gray-500">Loading map...</p>
          </div>
        }
      >
        <GeographyMap />
      </Suspense>
    </section>
  );
}
