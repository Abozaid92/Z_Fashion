"use client";

import { Link, useRouter } from "@/i18n/routing";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "react-toastify";
import { typeProps } from "./Navbar";

const AccountNav = ({ session }: { session: typeProps | null }) => {
  const r = useTranslations("auth" as any);
  const locale = useLocale();
  const router = useRouter();

  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isLocalAr = locale === "ar";

  async function handleLogout() {
    try {
      setIsLoading(true);
      await signOut({ redirect: false });
      router.refresh();
      router.push("/login");
      toast.success(r("logoutSuccessfully"));
    } catch {
      toast.error(r("failedLogout"));
    } finally {
      setIsLoading(false);
    }
  }

  function handleClick() {
    if (!session) {
      router.push("/login");
      return;
    }
    setIsUserOpen((prev) => !prev);
  }

  return (
    <div
      className={`
        relative flex items-center
        ${isLocalAr ? "order-3 md:order-1 md:ml-auto" : "order-1 md:order-3 md:mr-auto"}
      `}
    >
      {/* Trigger */}
      <button
        onClick={handleClick}
        className={`
          group flex items-center select-none
          ${isLocalAr ? "flex-row-reverse" : "flex-row"}
          gap-2 sm:gap-3
          px-2 sm:px-3 md:px-4
          py-1.5 sm:py-2
          rounded-xl sm:rounded-2xl

          hover:from-slate-100 hover:to-slate-200
          shadow-sm hover:shadow-md
          transition-all duration-300
          ${isUserOpen ? "ring-2 ring-blue-500/20" : ""}
        `}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={`
              w-8 h-8 sm:w-10 sm:h-10
              rounded-full overflow-hidden
              ring-2 ring-offset-2
              ${
                isUserOpen ?
                  "ring-blue-500 ring-offset-blue-50"
                : "ring-slate-300 group-hover:ring-slate-400"
              }
            `}
          >
            {session?.image ?
              <img
                src={session.image}
                alt="user"
                className="w-full h-full object-cover"
              />
            : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            }
          </div>
        </div>

        {/* Name */}
        {session && (
          <span className="hidden sm:block text-sm font-semibold text-slate-700 truncate max-w-[120px]">
            {session.name}
          </span>
        )}

        {/* Arrow */}
        {session && (
          <ChevronDown
            className={`
              hidden sm:block w-4 h-4 text-slate-400
              transition-transform duration-300
              ${isUserOpen ? "rotate-180 text-blue-600" : ""}
            `}
          />
        )}
      </button>

      {/* Backdrop */}
      {isUserOpen && (
        <div
          onClick={() => setIsUserOpen(false)}
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
        />
      )}

      {/* Dropdown */}
      {session && (
        <div
          className={`
            absolute z-50 top-full mt-3
            ${isLocalAr ? "left-0 sm:right-0 sm:left-auto" : "right-0"}
            w-[280px] sm:w-[320px]
            transition-all duration-200
            ${
              isUserOpen ?
                "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-2 pointer-events-none"
            }
          `}
        >
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5">
              <div
                className={`flex items-center gap-3 ${
                  isLocalAr ? "flex-row-reverse text-right" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {session.image ?
                    <img
                      src={session.image}
                      className="w-full h-full object-cover"
                    />
                  : <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                      <User />
                    </div>
                  }
                </div>

                <div className="truncate">
                  <h3 className="font-bold">{session.name}</h3>
                  <p className="text-sm text-slate-300 truncate">
                    {session.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="p-2 space-y-1">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50"
              >
                <Settings className="w-4 h-4" />
                {r("profile")}
              </Link>

              <Link
                href="/cart"
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100"
              >
                <ShoppingCart className="w-4 h-4" />
                {r("cart")}
              </Link>

              <Link
                href="/orders"
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100"
              >
                <CreditCard className="w-4 h-4" />
                {r("orders")}
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50"
              >
                {isLoading ?
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                : <LogOut className="w-4 h-4" />}
                {r("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountNav;
