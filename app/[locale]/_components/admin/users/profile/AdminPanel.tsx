"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import type { UserProfile } from "@/app/[locale]/_lib/profile";
import {
  sendNotificationAction,
  toggleUserStatusAction,
} from "@/app/[locale]/admin/users/[id]/admin-actions";

interface AdminPanelProps {
  user: UserProfile;
}

export function AdminPanel({ user }: AdminPanelProps) {
  const t = useTranslations("profile.admin" as any);
  const [isPending, startTransition] = useTransition();
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Calculate user insights
  const totalOrders = user.order.length;
  const lifetimeValue = user.order.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const avgOrderValue = totalOrders > 0 ? lifetimeValue / totalOrders : 0;

  const handleNotificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await sendNotificationAction(formData);

      if (result.success) {
        toast.success(result.message);
        e.currentTarget.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleStatusToggle = async () => {
    const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";

    if (
      !confirm(t("statusToggle.confirm", { status: newStatus.toLowerCase() }))
    ) {
      return;
    }

    setIsTogglingStatus(true);
    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("newStatus", newStatus);

    const result = await toggleUserStatusAction(formData);
    setIsTogglingStatus(false);

    if (result.success) {
      toast.success(result.message);
      window.location.reload(); // Reload to reflect status change
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <svg
          className="w-6 h-6 text-purple-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
        <h2 className="text-lg font-bold text-slate-900">{t("title")}</h2>
      </div>

      {/* Notification Form */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {t("notification.title")}
        </h3>

        <form onSubmit={handleNotificationSubmit} className="space-y-3">
          <input type="hidden" name="userId" value={user.id} />

          <div>
            <label
              htmlFor="notif-title"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {t("notification.titleLabel")}
            </label>
            <input
              type="text"
              id="notif-title"
              name="title"
              required
              maxLength={200}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder={t("notification.titlePlaceholder")}
            />
          </div>

          <div>
            <label
              htmlFor="notif-message"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {t("notification.messageLabel")}
            </label>
            <textarea
              id="notif-message"
              name="description"
              required
              maxLength={1000}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder={t("notification.messagePlaceholder")}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ?
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t("notification.sending")}
              </>
            : <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                {t("notification.send")}
              </>
            }
          </button>
        </form>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Insights */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {t("insights.title")}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm text-slate-600">
                {t("insights.lifetimeValue")}
              </span>
              <span className="text-xl font-bold text-emerald-700">
                ${lifetimeValue.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-slate-600">
                {t("insights.totalOrders")}
              </span>
              <span className="text-xl font-bold text-blue-700">
                {totalOrders}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-slate-600">
                {t("insights.avgOrderValue")}
              </span>
              <span className="text-xl font-bold text-purple-700">
                ${avgOrderValue.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-sm text-slate-600">
                {t("insights.favorites")}
              </span>
              <span className="text-xl font-bold text-amber-700">
                {user.favorite.length}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Status Toggle */}
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              {t("statusToggle.title")}
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {t("statusToggle.current")}
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs font-semibold ${
                    user.status === "ACTIVE" ?
                      "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status}
                </span>
              </div>

              <button
                onClick={handleStatusToggle}
                disabled={isTogglingStatus}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  user.status === "ACTIVE" ?
                    "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isTogglingStatus ?
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t("statusToggle.loading")}
                  </span>
                : user.status === "ACTIVE" ?
                  t("statusToggle.ban")
                : t("statusToggle.activate")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
