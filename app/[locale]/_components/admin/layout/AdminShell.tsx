"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

// ─────────────────────────────────────────────────────────────────────────────
// AdminShell — client wrapper that owns mobile sidebar toggle state.
// Kept here so the parent layout.tsx can remain a Server Component.
// ─────────────────────────────────────────────────────────────────────────────

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-body">
      {/* Sidebar — handles both desktop persistent and mobile overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content — scrollable */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
