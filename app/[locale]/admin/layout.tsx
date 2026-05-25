import type { Metadata } from "next";
import { DM_Sans, Syne, DM_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AdminShell } from "../_components/admin/layout/AdminShell";
// --- الإضافات الجديدة ---
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import pickMessages from "@/lib/i18n-utils";
// -----------------------

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["700", "800"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Z_Fashion Admin",
    template: "%s | Z_Fashion Admin",
  },
  description: "Enterprise E-commerce Admin Dashboard",
  robots: { index: false, follow: false },
};

// 1. حولنا الدالة لـ async وجبنا الـ params
export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // 2. جبنا الرسايل وصفيناها للقسم الخاص بالأدمن
  const messages = await getMessages();
  const { locale } = await params; // لضمان التوافق مع Next.js 15

  return (
    <div
      className={`${dmSans.variable} ${syne.variable} ${dmMono.variable} min-h-screen font-sans`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-lime-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* 3. تغليف الـ AdminShell بالـ Provider */}
      <NextIntlClientProvider
        locale={locale}
        messages={pickMessages(messages, [
          "AdminSidebar", // القسم اللي كان عامل المشكلة
          "Navbar",
          "auth",
          "AdminTopNav",
          "Common",
        ])}
      >
        <AdminShell>
          <div id="main-content">{children}</div>
        </AdminShell>
      </NextIntlClientProvider>
    </div>
  );
}
