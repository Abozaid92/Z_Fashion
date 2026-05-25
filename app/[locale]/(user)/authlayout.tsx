"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
  titleKey: string;
  subtitleKey: string;
}

export default function AuthLayout({
  children,
  titleKey,
  subtitleKey,
}: AuthLayoutProps) {
  const t = useTranslations("auth" as any);

  return (
    <>
      {/* Fixed overflow-x for RTL */}
      <div
        style={{ direction: "rtl" }}
        className="min-h-screen flex font-sans overflow-x-hidden"
      >
        {/* Left Side - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[#fafafa] relative z-10 overflow-hidden">
          {/* Subtle background glow - contained within parent */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
          </div>

          {/* Premium separator shadow on the right edge (hidden in RTL will flip automatically) */}
          <div className="hidden lg:block absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-slate-200/60 to-transparent" />
          <div className="hidden lg:block absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-slate-900/5 to-transparent pointer-events-none" />

          <div className="w-full max-w-md space-y-10 relative z-20">
            {/* Logo & Header */}
            <div className="flex flex-col items-center text-center">
              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {t(titleKey)}
                </h1>
                <div className="flex justify-center">
                  <div className="h-1 w-12 bg-emerald-500 rounded-full opacity-40"></div>
                </div>
                <p className="text-slate-500 font-medium text-lg max-w-[280px] mx-auto leading-relaxed">
                  {t(subtitleKey)}
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-transparent">{children}</div>
          </div>
        </div>

        {/* Right Side - Image Section (Desktop) */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 bg-slate-900">
            <Image
              src="https://res.cloudinary.com/dfhecwiib/image/upload/v1777451809/Auth_logo_hgcyge.png"
              alt="Authentication visual"
              fill
              className="object-cover opacity-90"
              priority
              quality={100}
            />
            {/* Elegant gradient overlay that connects with form section */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fafafa]/20 via-transparent to-transparent" />
          </div>

          {/* Branding overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white tracking-wide">
                Welcome to Z Fashion
              </h2>
              <p className="text-emerald-100/80 text-base leading-relaxed max-w-sm">
                Discover the latest trends and redefine your style with our
                exclusive collection.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Background Image - with overflow control */}
        <div className="lg:hidden fixed inset-0 -z-10 overflow-hidden">
          <Image
            src="https://res.cloudinary.com/dfhecwiib/image/upload/v1777451809/Auth_logo_hgcyge.png"
            alt="Authentication background"
            fill
            className="object-cover blur-[2px]"
            priority
            quality={70}
          />
          <div className="absolute inset-0 bg-[#fafafa]/95 backdrop-blur-md" />
        </div>
      </div>
    </>
  );
}
