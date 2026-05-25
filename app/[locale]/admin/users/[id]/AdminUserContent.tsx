"use client";

import { useUserProfile } from "@/hooks/use-profile";
import { ProfileHeader } from "@/app/[locale]/_components/admin/users/profile/ProfileHeader";
import { MiniCart } from "@/app/[locale]/_components/admin/users/profile/MiniCart";
import { FavoritesGrid } from "@/app/[locale]/_components/admin/users/profile/FavoritesGrid";
import { AdminPanel } from "@/app/[locale]/_components/admin/users/profile/AdminPanel";
import ProfileSkeleton from "@/app/[locale]/utils/ProfileSkeleton";
import { RecentOrders } from "@/app/[locale]/_components/admin/users/profile/RecentOrders";

interface AdminUserContentProps {
  locale: string;
  userId: string;
}

export function AdminUserContent({ locale, userId }: AdminUserContentProps) {
  const { data: user, isLoading, error } = useUserProfile(userId);

  if (isLoading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
        <svg
          className="w-16 h-16 text-red-400 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Failed to load user profile
        </h3>
        <p className="text-slate-600">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader user={user} />

      {/* Admin Panel - Always visible for admin view */}
      <AdminPanel user={user} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Cart */}
        <div className="lg:col-span-1">
          <MiniCart items={user.cart} locale={locale} />
        </div>

        {/* Right Column - Favorites & Orders */}
        <div className="lg:col-span-2 space-y-6">
          <FavoritesGrid favorites={user.favorite} locale={locale} />
          <RecentOrders orders={user.order as any} locale={locale} />
        </div>
      </div>
    </div>
  );
}
