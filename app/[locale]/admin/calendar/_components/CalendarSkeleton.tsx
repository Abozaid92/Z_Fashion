export function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-32 bg-slate-200 rounded-lg" />
              <div className="h-10 w-24 bg-slate-200 rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-20 bg-slate-200 rounded-lg" />
              <div className="h-10 w-20 bg-slate-200 rounded-lg" />
              <div className="h-10 w-20 bg-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="h-10 w-full bg-slate-200 rounded-lg" />
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-200 rounded" />
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
