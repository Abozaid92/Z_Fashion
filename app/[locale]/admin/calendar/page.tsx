import { Suspense } from "react";
import dynamic from "next/dynamic";
import { CalendarSkeleton } from "./_components/CalendarSkeleton";

// Lazy load with minimal loading state
const CalendarView = dynamic(() => import("./_components/CalendarView"), {
  ssr: true,
  loading: () => <CalendarSkeleton />,
});

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Calendar
          </h1>
          <p className="text-slate-600 mt-1">Manage your events and schedule</p>
        </div>

        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarView />
        </Suspense>
      </div>
    </div>
  );
}
