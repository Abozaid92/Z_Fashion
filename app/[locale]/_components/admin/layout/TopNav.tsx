"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react"; // استوردنا X للأيقونة
// ─────────────────────────────────────────────────────────────────────────────
// TopNav — header bar: hamburger | breadcrumb | search | notifications | user
// Height: h-16 (4rem). Pages using calc(100vh - nav) should use calc(100vh - 4rem)
// ─────────────────────────────────────────────────────────────────────────────

interface TopNavProps {
  onMenuClick: () => void;
}

// Page title map → replace with useTranslations for i18n
const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/users": "Users",
  "/admin/products/new": "Add Product",
  "/admin/support": "Support",
  "/admin/notifications": "Notifications",
  "/admin/calendar": "Calendar",
  "/admin/settings": "Settings",
};

export function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();

  const t = useTranslations("Notifications" as any);
  const r = useTranslations("AdminTopNav" as any);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // حالة التحكم في ظهور الرسالة
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pageTitle = PAGE_TITLES[pathname] ?? "Admin";

  // فحص الـ sessionStorage عند التحميل
  useEffect(() => {
    const isDismissed = sessionStorage.getItem("hide_stats_alert");
    if (!isDismissed) {
      setIsBannerVisible(true);
    }

    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // دالة إخفاء الرسالة
  const handleDismiss = () => {
    setIsBannerVisible(false);
    sessionStorage.setItem("hide_stats_alert", "true");
  };

  return (
    <header
      className="h-16 bg-white border-b border-slate-200/80 flex items-center px-4 gap-3 shrink-0 z-30"
      role="banner"
    >
      {/* ── Hamburger (mobile) ── */}
      <button
        type="button"
        onClick={onMenuClick}
        className="xl:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* ── Page Title & Alert Message ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-slate-800 font-display truncate shrink-0">
          {pageTitle}
        </h1>

        {/* الرسالة التحذيرية */}
        {isBannerVisible && (
          <div className="flex items-center gap-3 py-1 px-3 bg-amber-100 border-2 border-amber-300 rounded-lg shadow-sm">
            <span className="text-2xl animate-bounce">✋</span>
            <p className="text-lg md:text-xl lg:text-2xl font-black text-amber-900 leading-tight">
              {r("alert")}
            </p>
            <span className="text-2xl hidden sm:inline">📊</span>

            {/* زر الإخفاء */}
            <button
              onClick={handleDismiss}
              className="ml-2 flex items-center gap-1 px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 text-sm font-bold rounded-md transition-colors border border-amber-400"
            >
              <X size={16} />
              <span> Hide now</span>
            </button>
          </div>
        )}
      </div>
      {/* ── Notifications & User Menu (Rest of components) ── */}
    </header>
  );
}
