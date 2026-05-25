"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { useNavCategories } from "@/hooks/use-nav-categories";
import { cn } from "@/app/[locale]/_lib/utils";

// ─────────────────────────────────────────────────────────────
// DesktopNav — categories بتيجي hydrated من الـ server
// الـ Home بتاع static، الباقي ديناميك من الـ DB
// CSS-only hover dropdown — zero JS for open/close
// ─────────────────────────────────────────────────────────────
const DesktopNav = () => {
  const t = useTranslations("nav" as any);
  const r = useTranslations("nav.ctg" as any);
  const pathname = usePathname();
  const { data: categories = [] } = useNavCategories();

  return (
    <nav
      className="hidden md:flex items-center gap-0"
      aria-label="Main navigation"
      role="navigation"
    >
      {/* ── Home — static link ─────────────────────────────── */}
      <NavLink href="/admin" active={pathname === "/admin"}>
        {t("dashboard")}
      </NavLink>
      <NavLink href="/" active={pathname === "/"}>
        {t("home")}
      </NavLink>

      {/* ── Dynamic root categories ─────────────────────────── */}
      {categories.map((cat) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const catPath = `/products?cat=${cat.slug}`;

        if (!hasChildren) {
          // Leaf category — plain link, no dropdown
          return (
            <NavLink
              key={cat.id}
              href={catPath}
              active={pathname.includes(cat.slug)}
            >
              {r(cat.name)}
            </NavLink>
          );
        }

        // Root category WITH children → CSS hover dropdown
        return (
          <CategoryDropdown
            key={cat.id}
            r={r}
            category={cat}
            isActive={pathname.includes(cat.slug)}
          />
        );
      })}
      <NavLink href="/about" active={pathname === "/about"}>
        {t("about")}
      </NavLink>
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────
// Plain nav link
// ─────────────────────────────────────────────────────────────
function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-4 py-2 text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150",
        "text-stone-600 hover:text-stone-950",
        // Active underline
        active && "text-stone-950",
      )}
    >
      {children}
      {/* Animated underline */}
      <span
        className={cn(
          "absolute bottom-0 left-4 right-4 h-[1.5px] bg-stone-950 scale-x-0 transition-transform duration-200 origin-left",
          active ? "scale-x-100" : "group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// Category with dropdown — CSS `group` + `group-hover` only
// No useState, no JS toggle
// ─────────────────────────────────────────────────────────────
function CategoryDropdown({
  category,
  isActive,
  r,
}: {
  category: NonNullable<ReturnType<typeof useNavCategories>["data"]>[number];
  isActive: boolean;
  r: ReturnType<typeof useTranslations>;
}) {
  // console.log(category);
  return (
    /*
      `group` on the container:
      - hover on container → dropdown becomes visible
      - pt-px on dropdown bridges the 1px gap so mouse can travel down
    */
    <div className="relative group" role="none">
      {/* ── Trigger ─────────────────────────────────────────── */}
      <Link
        href={`/products?cat=${category.slug}`}
        className={cn(
          "relative flex items-center gap-0.5 px-4 py-2",
          "text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150",
          "text-stone-600 hover:text-stone-950 group-hover:text-stone-950",
        )}
        aria-haspopup="true"
        aria-expanded="false"
      >
        {r(category.name)}
        {/* Subtle chevron */}
        <svg
          className="w-2.5 h-2.5 ml-0.5 mt-px text-stone-400 transition-transform duration-200 group-hover:rotate-180"
          fill="none"
          viewBox="0 0 10 10"
          aria-hidden="true"
        >
          <path
            d="M2 3.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Active / hover underline */}
        <span
          className={cn(
            "absolute bottom-0 left-4 right-4 h-[1.5px] bg-stone-950 transition-transform duration-200 origin-left",
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
          )}
        />
      </Link>

      {/*
        ── Dropdown panel ────────────────────────────────────────
        Technique:
        - invisible + opacity-0 + translate-y-1 → default
        - group-hover: visible + opacity-100 + translate-y-0
        - pointer-events-none → pointer-events-auto on hover
        - pt-1.5 bridges the gap so mouse can reach the panel
        - All CSS, zero JS
      */}
      <div
        className={cn(
          "absolute top-full left-0 z-50 pt-1.5",
          // Invisible by default
          "invisible opacity-0 translate-y-1 pointer-events-none",
          // CSS hover reveal — smooth
          "group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto",
          "transition-all duration-200 ease-out",
        )}
        role="menu"
        aria-label={`${category.name} sub-categories`}
      >
        {/* Panel */}
        <div className="bg-white border border-stone-150 shadow-[0_8px_32px_rgba(0,0,0,0.10)] rounded-xl overflow-hidden min-w-[180px]">
          {/* Optional: category link at top */}
          <Link
            href={`/products?cat=${category.slug}`}
            className="flex items-center justify-between px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400 hover:text-stone-700 border-b border-stone-100 hover:bg-stone-50 transition-colors"
            role="menuitem"
          >
            {r("all")} {r(category.name)}
          </Link>

          {/* Children */}
          {category.children.map((child: any, i: any) => (
            <Link
              key={child.id}
              href={`/products?cat=${child.slug}`}
              className={cn(
                "flex items-center justify-between px-4 py-2.5",
                "text-[13px] font-medium text-stone-700",
                "hover:bg-stone-50 hover:text-stone-950",
                "transition-colors duration-100",
                i < category.children.length - 1 && "border-b border-stone-50",
              )}
              role="menuitem"
            >
              <span>{r(child.name)}</span>
              {/* show chevron in case we ever add 3rd level */}
              <ChevronRight size={12} className="text-stone-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DesktopNav;
