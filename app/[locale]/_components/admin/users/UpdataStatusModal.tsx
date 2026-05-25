// app/admin/users/_components/UpdateStatusModal.tsx
"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck, ShieldOff } from "lucide-react";
import type { UserRow } from "../../../utils/AllUserType";

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  {
    value: "ACTIVE" as const,
    label: "Active",
    description: "User can log in and use the store normally.",
    icon: ShieldCheck,
    style: "border-emerald-300 bg-emerald-50 text-emerald-700 ring-emerald-300",
    dot: "bg-emerald-500",
  },
  {
    value: "BANNED" as const,
    label: "Banned",
    description: "User is blocked from accessing the store.",
    icon: ShieldOff,
    style: "border-red-300 bg-red-50 text-red-700 ring-red-300",
    dot: "bg-red-500",
  },
] as const;

export const statusBadgeStyle = (status: string) =>
  status === "ACTIVE" ?
    "bg-emerald-50 text-emerald-700 border-emerald-200"
  : "bg-red-50 text-red-600 border-red-200";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
interface Props {
  user: UserRow | null;
  onClose: () => void;
  onConfirm: (userId: string, status: "ACTIVE" | "BANNED") => void;
  isPending: boolean;
}

export default function UpdateStatusModal({
  user,
  onClose,
  onConfirm,
  isPending,
}: Props) {
  const isOpen = !!user;
  const [selected, setSelected] = useState<"ACTIVE" | "BANNED">("ACTIVE");

  // Sync selection to user's current status when modal opens
  useEffect(() => {
    if (user) setSelected(user.status);
  }, [user]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, isPending, onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isUnchanged = selected === user?.status;
  const initials =
    user?.name ?
      user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">
            Update User Status
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-40"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── User info ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          {user?.image ?
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="size-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
            />
          : <div className="size-10 rounded-full border border-slate-200 bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
              {initials}
            </div>
          }
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.name ?? "—"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email ?? "—"}
            </p>
          </div>
        </div>

        {/* ── Radio options ──────────────────────────────────── */}
        <div className="p-5 space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Select new status
          </p>

          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setSelected(opt.value)}
                disabled={isPending}
                className={`
                  w-full flex items-center gap-3.5 rounded-xl border px-4 py-3
                  text-left transition-all duration-150 disabled:cursor-not-allowed
                  ${
                    isActive ?
                      `${opt.style} ring-2 scale-[1.01] shadow-sm`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                {/* Custom radio circle */}
                <span
                  className={`
                  flex size-4 flex-shrink-0 items-center justify-center
                  rounded-full border-2 transition-colors
                  ${isActive ? "border-current" : "border-slate-300"}
                `}
                >
                  {isActive && (
                    <span className={`size-2 rounded-full ${opt.dot}`} />
                  )}
                </span>

                <Icon size={15} className="flex-shrink-0" />

                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold leading-tight ${isActive ? "" : "text-slate-700"}`}
                  >
                    {opt.label}
                  </p>
                  <p
                    className={`text-[11px] leading-snug mt-0.5 ${isActive ? "opacity-70" : "text-slate-400"}`}
                  >
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={() => user && onConfirm(user.id, selected)}
            disabled={isPending || isUnchanged}
            className={`
              rounded-lg px-4 py-2 text-sm font-semibold text-white
              transition-colors disabled:cursor-not-allowed disabled:opacity-40
              ${
                selected === "BANNED" ?
                  "bg-red-500 hover:bg-red-600"
                : "bg-emerald-500 hover:bg-emerald-600"
              }
            `}
          >
            {isPending ?
              <span className="flex items-center gap-2">
                <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving…
              </span>
            : `Set as ${selected === "ACTIVE" ? "Active" : "Banned"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
