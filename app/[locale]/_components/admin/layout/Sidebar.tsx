"use client";

import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  MessageSquare,
  Bell,
  CalendarDays,
  Settings,
  ChevronRight,
  X,
  Zap,
  BarChart2,
  TrendingUp,
  PieChart,
  Layers,
  Headphones,
} from "lucide-react";
import { cn } from "../../../_lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// Desktop: always visible, w-64, left-side persistent panel
// Mobile: overlay from left, snappy translate transition (200ms)
// Theme: Premium Light Slate (Slightly darker than pure white for contrast)
// ─────────────────────────────────────────────────────────────────────────────

interface SubNavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  children?: SubNavItem[];
}

interface NavSectionType {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const BADGE_COUNTS: Record<string, number> = {
  "/en/admin/orders": 3,
  "/en/admin/support": 4,
  "/en/admin/notifications": 1,
};

const NAV_SECTIONS: NavSectionType[] = [
  {
    label: "Main",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: "LayoutDashboard",
        exact: true,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", icon: "ShoppingCart" },
      { href: "/admin/users", label: "Users", icon: "Users" },
      { href: "/admin/products/product", label: "Products", icon: "Package" },
      {
        href: "/admin/products/category",
        label: "Categories",
        icon: "Layers",
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        href: "/admin/charts",
        label: "Charts",
        icon: "BarChart2",
        children: [
          { href: "/admin/charts/users", label: "users", icon: "Users" },
          {
            href: "/admin/charts/orders",
            label: "orders",
            icon: "ShoppingCart",
          },
          {
            href: "/admin/charts/revenue",
            label: "revenue",
            icon: "TrendingUp",
          },
          {
            href: "/admin/charts/net-profit",
            label: "net profit",
            icon: "BarChart2",
          },
          {
            href: "/admin/charts/complaints",
            label: "complaints",
            icon: "MessageSquare",
          },
          {
            href: "/admin/charts/products",
            label: "products",
            icon: "Package",
          },
          {
            href: "/admin/charts/views",
            label: "views",
            icon: "Package",
          },
        ],
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        href: "/admin/support",
        label: "support_and_complaint",
        icon: "Headphones",
      },
      { href: "/admin/notifications", label: "Notifications", icon: "Bell" },
      { href: "/admin/calendar", label: "Calendar", icon: "CalendarDays" },
    ],
  },
  // {
  //   label: "System",
  //   items: [
  //     { href: "/en/admin/settings", label: "Settings", icon: "Settings" },
  //   ],
  // },
];

const ICON_MAP: Record<
  string,
  React.FC<{ size?: number; className?: string }>
> = {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  MessageSquare,
  Bell,
  CalendarDays,
  Headphones,
  Settings,
  BarChart2,
  TrendingUp,
  PieChart,
  Layers,
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("AdminSidebar" as any);

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      NAV_SECTIONS.forEach((section) => {
        section.items.forEach((item) => {
          if (item.children?.some((child) => pathname.startsWith(child.href))) {
            initial[item.href] = true;
          }
        });
      });
      return initial;
    },
  );

  useEffect(() => {
    if (pathname.includes("/charts/")) {
      setExpandedItems((prev) => ({ ...prev, "/en/admin/charts": true }));
    }
  }, [pathname]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    if (href === "/en/admin") return pathname === "/en/admin";
    return pathname.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => pathname.startsWith(child.href));
    }
    return isActive(item.href, item.exact);
  };

  const sidebarContent = (
    <nav
      aria-label={t("nav.aria_label")}
      // غيرنا الأبيض الصريح لـ slate-50 عشان يفصل عن الـ Main Content
      className="flex flex-col h-full bg-slate-50 border-r border-slate-200 text-slate-700 w-64 shrink-0 shadow-sm"
    >
      {/* ── Nav Sections ── */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-7 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400 select-none">
              {t(`sections.${section.label.toLowerCase()}`)}
            </p>

            <ul className="space-y-1" role="list">
              {section.items.map((item) => {
                const Icon = ICON_MAP[item.icon];
                const hasChildren = !!item.children?.length;
                const isExpanded = expandedItems[item.href];
                const active = isParentActive(item);
                const badge = BADGE_COUNTS[item.href];

                return (
                  <li key={item.href}>
                    {/* ── Parent Item ── */}
                    {hasChildren ?
                      <button
                        type="button"
                        onClick={() => toggleExpanded(item.href)}
                        aria-expanded={isExpanded}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                          active || isExpanded ?
                            "bg-emerald-100/60 text-emerald-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
                        )}
                      >
                        {(active || isExpanded) && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full"
                          />
                        )}

                        {Icon && (
                          <Icon
                            size={18}
                            {...({
                              strokeWidth: active || isExpanded ? 2.5 : 2,
                            } as any)}
                            className={cn(
                              "shrink-0 transition-colors",
                              active || isExpanded ? "text-emerald-600" : (
                                "text-slate-400 group-hover:text-slate-600"
                              ),
                            )}
                          />
                        )}

                        <span className="flex-1 text-left truncate">
                          {t(`items.${item.label.toLowerCase()}`)}
                        </span>

                        <ChevronRight
                          size={14}
                          className={cn(
                            "shrink-0 transition-transform duration-200 ease-out",
                            isExpanded ?
                              "rotate-90 text-emerald-600"
                            : "text-slate-400 group-hover:text-slate-600",
                          )}
                        />
                      </button>
                    : <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={
                          isActive(item.href, item.exact) ? "page" : undefined
                        }
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                          isActive(item.href, item.exact) ?
                            "bg-emerald-100/60 text-emerald-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
                        )}
                      >
                        {isActive(item.href, item.exact) && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full"
                          />
                        )}

                        {Icon && (
                          <Icon
                            size={18}
                            {...({
                              strokeWidth:
                                isActive(item.href, item.exact) ? 2.5 : 2,
                            } as any)}
                            className={cn(
                              "shrink-0 transition-colors",
                              isActive(item.href, item.exact) ?
                                "text-emerald-600"
                              : "text-slate-400 group-hover:text-slate-600",
                            )}
                          />
                        )}

                        <span className="flex-1 truncate">
                          {t(`items.${item.label.toLowerCase()}`)}
                        </span>

                        {badge && badge > 0 && (
                          <span
                            aria-label={t("badge.pending_count", {
                              count: badge,
                            })}
                            className="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-[11px] font-bold leading-none shadow-sm"
                          >
                            {badge > 9 ? "9+" : badge}
                          </span>
                        )}
                      </Link>
                    }

                    {/* ── Sub Items (collapsible) ── */}
                    {hasChildren && (
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-200 ease-in-out",
                          isExpanded ?
                            "max-h-70 opacity-100 mt-1"
                          : "max-h-0 opacity-0",
                        )}
                      >
                        <ul className="ml-5 pl-4 space-y-1 border-l border-slate-300">
                          {item.children!.map((child) => {
                            const ChildIcon = ICON_MAP[child.icon];
                            const childActive =
                              pathname === child.href ||
                              pathname.startsWith(child.href);

                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  aria-current={
                                    childActive ? "page" : undefined
                                  }
                                  className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 group relative",
                                    childActive ?
                                      "text-emerald-700 bg-emerald-100/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50",
                                  )}
                                >
                                  {childActive && (
                                    <span
                                      aria-hidden="true"
                                      className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"
                                    />
                                  )}

                                  {ChildIcon && (
                                    <ChildIcon
                                      size={14}
                                      className={cn(
                                        "shrink-0 transition-colors",
                                        childActive ? "text-emerald-600" : (
                                          "text-slate-400 group-hover:text-slate-500"
                                        ),
                                      )}
                                    />
                                  )}
                                  <span className="truncate capitalize">
                                    {t(`subitems.${child.label.toLowerCase()}`)}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden xl:flex xl::shrink-0 h-screen sticky top-0"
        aria-label={t("sidebar.aria_label")}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile Sidebar Overlay (Snappy Toggle) ── */}
      <div
        className={cn(
          // قللنا الـ duration لـ 200 عشان تبقى snappy
          "fixed inset-0 z-50 xl:hidden transition-all duration-200 ease-out",
          isOpen ?
            "opacity-100 visible"
          : "opacity-0 invisible pointer-events-none",
        )}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        {/* Backdrop - غمقناه سنة عشان يفصل عن الموقع */}
        <div
          className={cn(
            "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ease-out",
            isOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Panel - قللنا الـ duration لـ 200 */}
        <aside
          className={cn(
            "absolute left-0 top-0 bottom-0 w-64 bg-slate-50 transition-transform duration-200 ease-out shadow-2xl",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
