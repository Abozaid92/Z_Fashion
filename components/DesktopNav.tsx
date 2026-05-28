"use client";

import { useState, useEffect } from "react"; // 👈 إضافة الهوكس هنا لتتبع حالة اللمس والفتح
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
// Category with dropdown — Hybrid (CSS hover on Desktop / JS click on Touch)
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const touchQuery = window.matchMedia("(pointer: coarse)");
    setIsTouchDevice(touchQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    touchQuery.addEventListener("change", handler);
    return () => touchQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div className="relative group" role="none">
      {/* Backdrop خفي لغلق القائمة عند الضغط في أي مكان خارجي على أجهزة اللمس */}
      {isTouchDevice && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Trigger ─────────────────────────────────────────── */}
      <Link
        href={`/products?cat=${category.slug}`}
        onClick={(e) => {
          if (isTouchDevice) {
            e.preventDefault(); // منع الانتقال الفوري على الموبايل/التابلت
            setIsOpen((prev) => !prev); // تشغيل الـ Toggle بدلاً منه
          }
        }}
        className={cn(
          "relative flex items-center gap-0.5 px-4 py-2",
          "text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150",
          "text-stone-600",
          !isTouchDevice ? "hover:text-stone-950 group-hover:text-stone-950"
          : isOpen ? "text-stone-950"
          : "",
        )}
        aria-haspopup="true"
        aria-expanded={isOpen ? "true" : "false"}
      >
        {r(category.name)}
        {/* Subtle chevron */}
        <svg
          className={cn(
            "w-2.5 h-2.5 ml-0.5 mt-px text-stone-400 transition-transform duration-200",
            !isTouchDevice ? "group-hover:rotate-180"
            : isOpen ? "rotate-180"
            : "",
          )}
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
            isActive ? "scale-x-100"
            : !isTouchDevice ? "scale-x-0 group-hover:scale-x-100"
            : isOpen ? "scale-x-100"
            : "scale-x-0",
          )}
        />
      </Link>

      {/* ── Dropdown panel ──────────────────────────────────────── */}
      <div
        className={cn(
          "absolute top-full left-0 z-50 pt-1.5",
          "invisible opacity-0 translate-y-1 pointer-events-none",
          // ديناميكية التحكم: CSS للكمبيوتر والـ State للموبايل/التابلت
          !isTouchDevice &&
            "group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto",
          isTouchDevice &&
            isOpen &&
            "visible opacity-100 translate-y-0 pointer-events-auto",
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
            onClick={() => isTouchDevice && setIsOpen(false)}
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
              onClick={() => isTouchDevice && setIsOpen(false)} // غلق القائمة بعد اختيار العنصر الفرعي
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
              <ChevronRight size={12} className="text-stone-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DesktopNav;
