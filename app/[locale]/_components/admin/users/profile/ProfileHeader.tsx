import { useTranslations } from "next-intl";
import Image from "next/image";
import type { UserProfile } from "@/app/[locale]/_lib/profile";
interface ProfileHeaderProps {
  user: UserProfile;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const t = useTranslations("profile" as any);

  const statusColors = {
    ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
    BANNED: "bg-red-100 text-red-800 border-red-200",
  };

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-emerald-50">
            {user.image ?
              <Image
                src={user.image}
                alt={user.name || "User avatar"}
                width={112}
                height={112}
                className="object-cover w-full h-full"
                priority
              />
            : <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            }
          </div>

          {/* Status Badge */}
          <div
            className={`absolute -bottom-1 -right-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[user.status]}`}
          >
            {user.status}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 truncate">
            {user.name || "Anonymous User"}
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate">{user.email || "No email"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{user.country}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{t("joined", { date: joinDate })}</span>
            </div>
          </div>

          {/* Role Badge */}
          {user.role === "ADMIN" && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-purple-700">
                Administrator
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
