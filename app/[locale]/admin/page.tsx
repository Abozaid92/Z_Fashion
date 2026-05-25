import AdminDashboardClient from "@/app/[locale]/_components/admin/dashboard/AdminDashboardClient";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/lib/i18n-utils";
import { getStatsAndchart } from "./dashboard.actions";
import getQueryClient from "@/lib/getQueryClient";
import { Suspense } from "react";
// Server Component with revalidation
export const revalidate = 10; // Revalidate every 10 seconds

async function getDashboardData() {
  const data = await getStatsAndchart();
  return data;
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const queryClient = getQueryClient();

  // Prefetch data on server
  await queryClient.prefetchQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    staleTime: 10 * 1000,
  });

  return (
    <NextIntlClientProvider
      locale={params as any}
      messages={pickMessages(await getMessages(await params), [
        "AdminDashboardClient",
        "AdminStats",
        "AdminChartsUI",
        "AdminChartsLabels",
        "AdminLatestUsers",
        "AdminLatestOrders",
        "AdminGeography",
        "AdminTopNav",
      ])}
    >
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardClient />
      </Suspense>
    </NextIntlClientProvider>
  );
}

function AdminDashboardSkeleton() {
  return (
    // الحاوية الرئيسية بنفس الـ padding المتوقع للـ Client Component
    <div className="p-4 space-y-8 animate-pulse sm:p-6 lg:p-8 bg-gray-50/50">
      {/* 1. قسم كروت الإحصائيات (Stat Cards) */}
      {/* بنعمل شبكة (Grid) بتتجاوب مع حجم الشاشة */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl"
          >
            <div className="flex items-center justify-between space-x-4">
              {/* مكان الأيقونة (دائرة) */}
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              {/* مكان النسبة المئوية أو التغير (مستطيل صغير) */}
              <div className="w-16 h-6 bg-gray-100 rounded-lg" />
            </div>

            <div className="mt-5 space-y-3">
              {/* عنوان الكارت (مثلاً: إجمالي المبيعات) */}
              <div className="w-2/3 h-5 bg-gray-200 rounded-md" />
              {/* الرقم الكبير (مثلاً: $50,000) */}
              <div className="w-1/2 h-9 bg-gray-300 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. قسم الرسوم البيانية والجداول (Charts & Tables Section) */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* الرسم البياني الرئيسي (مثلاً: مبيعات السنة) - بياخد ثلثين المساحة */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm xl:col-span-2 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            {/* عنوان الشارت */}
            <div className="w-48 h-7 bg-gray-200 rounded-lg" />
            {/* أزرار الفلترة (مثلاً: سنة، شهر) */}
            <div className="flex space-x-2">
              <div className="w-20 h-9 bg-gray-100 rounded-lg" />
              <div className="w-20 h-9 bg-gray-100 rounded-lg" />
            </div>
          </div>
          {/* محاكاة شكل الشارت (مستطيل كبير بارتفاع محدد) */}
          <div className="w-full h-80 bg-gray-100 rounded-xl flex items-end p-4 space-x-2">
            {/* أعمدة بيانية وهمية بارتفاعات مختلفة */}
            {[...Array(12)].map((_, i) => {
              const heights = ["h-20", "h-32", "h-48", "h-64", "h-40", "h-56"];
              return (
                <div
                  key={i}
                  className={`flex-1 bg-gray-200 rounded-t ${heights[i % heights.length]}`}
                />
              );
            })}
          </div>
        </div>

        {/* أقسام جانبية (مثلاً: أحدث الطلبات أو التوزيع الجغرافي) - بياخد ثلث المساحة */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl space-y-6">
          {/* عنوان القسم */}
          <div className="w-40 h-7 bg-gray-200 rounded-lg" />

          {/* محاكاة قائمة (List Skeleton) */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              {/* صورة مصغرة أو أيقونة (دائرة) */}
              <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                {/* اسم العميل أو المنتج */}
                <div className="w-3/4 h-4 bg-gray-200 rounded" />
                {/* تفاصيل إضافية */}
                <div className="w-1/2 h-3 bg-gray-100 rounded" />
              </div>
              {/* السعر أو الحالة */}
              <div className="w-16 h-5 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. جدول البيانات السفلي (Bottom Data Table) */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          {/* عنوان الجدول */}
          <div className="w-56 h-7 bg-gray-200 rounded-lg" />
          {/* زر إضافة أو فلترة */}
          <div className="w-32 h-10 bg-gray-100 rounded-lg" />
        </div>

        {/* محاكاة صفوف الجدول (Table Rows) */}
        <div className="space-y-4">
          {/* صف الرأس (Header Row) */}
          <div className="grid grid-cols-5 gap-4 py-2 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded col-span-2" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
          </div>
          {/* صفوف البيانات المكررة */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 py-3 items-center border-b border-gray-50 last:border-0"
            >
              <div className="h-5 bg-gray-100 rounded col-span-2" />
              <div className="h-5 bg-gray-100 rounded" />
              <div className="h-5 bg-gray-100 rounded" />
              <div className="w-24 h-8 bg-gray-100 rounded-lg" />{" "}
              {/* زر أكشن */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
