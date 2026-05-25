import ProfileSkeleton from "@/app/[locale]/utils/ProfileSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-48" />
        </div>

        {/* Page Header Skeleton */}
        <div className="mb-8 flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-slate-200" />
          <div className="space-y-2">
            <div className="h-10 bg-slate-200 rounded-lg w-64" />
            <div className="h-4 bg-slate-200 rounded w-96" />
          </div>
        </div>

        <ProfileSkeleton />
      </div>
    </div>
  );
}
