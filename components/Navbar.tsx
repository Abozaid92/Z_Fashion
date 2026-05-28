"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import useGetItemsInCart from "@/hooks/getItemsInCart";
import Lang from "./lang";
import DesktopNav from "./DesktopNav";
import AccountNav from "./accountNav";
import CartNav from "./cardtNav";
import { useNavCategories } from "@/hooks/use-nav-categories";
import { cn } from "@/app/[locale]/_lib/utils";
import BellModal from "./bell";

export interface typeProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
}

export default function Navbar({ session }: { session: typeProps | null }) {
  const t = useTranslations("Navbar" as any);
  const r = useTranslations("Navbar.mobileMenu.ctg" as any);
  const { data } = useGetItemsInCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);

  const navRef = useRef<HTMLElement | null>(null);

  // Detect wrap (multi-line)
  useEffect(() => {
    function checkWrap() {
      if (!navRef.current) return;

      const height = navRef.current.offsetHeight;

      // 64px = height الطبيعي
      setIsWrapped(height > 70);
    }

    checkWrap();
    window.addEventListener("resize", checkWrap);

    return () => window.removeEventListener("resize", checkWrap);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          "top-0 z-50 bg-white border-b border-stone-100 transition-all",
          !isWrapped && "sticky",
        )}
        style={{ boxShadow: "0 1px 0 0 rgb(231 229 228)", direction: "ltr" }}
        role="navigation"
        aria-label={t("aria_label")}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-y-2 min-h-[60px] sm:min-h-16 py-2">
            {/* Logo */}
            <div className="flex items-center shrink-0 z-50">
              <Lang />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <CartNav />
              <BellModal session={session?.id as any} />
              <AccountNav session={session} />
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={
                  isMenuOpen ? t("mobileMenu.close") : t("mobileMenu.open")
                }
                className="md:hidden flex size-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 ml-1"
              >
                {isMenuOpen ?
                  <X size={18} />
                : <Menu size={18} />}
              </button>
            </div>

            {/* Desktop Nav */}
            <div className="w-full flex justify-center md:w-auto md:flex-1 order-last md:order-none">
              <DesktopNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-xl md:hidden overflow-y-auto"
            >
              <MobileMenuContent
                r={r}
                t={t}
                onClose={() => setIsMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileMenuContent({ t, r, onClose }: any) {
  const { data: categories = [] } = useNavCategories();
  const [openCat, setOpenCat] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full text-black/10">
      <div className="flex items-center justify-between px-5 text-black/10 py-4 border-b">
        <p className="font-bold">{t("mobileMenu.title")}</p>
        <button onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 py-4">
        <Link
          href="/admin"
          onClick={onClose}
          className="block text-black/10 px-5 py-3"
        >
          {t("mobileMenu.AdminDashboard")}
        </Link>
        <Link
          href="/"
          onClick={onClose}
          className="block text-black/10 px-5 py-3"
        >
          {t("mobileMenu.home")}
        </Link>

        {categories.map((cat: any) => {
          const isOpen = openCat === cat.id;

          return (
            <div key={cat.id}>
              <button
                onClick={() => setOpenCat(isOpen ? null : cat.id)}
                className="w-full flex justify-between px-5 py-3 text-black/10"
              >
                {r(cat.name)}
                <ChevronDown className={cn(isOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                  >
                    {cat.children?.map((child: any) => (
                      <Link
                        key={child.id}
                        href={`/products?cat=${child.slug}`}
                        onClick={onClose}
                        className="block text-black/10 px-8 py-2"
                      >
                        {r(child.name)}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <Link
          href="/about"
          onClick={onClose}
          className="block text-black/10 px-5 py-3"
        >
          {t("mobileMenu.about")}
        </Link>
      </div>
    </div>
  );
}
