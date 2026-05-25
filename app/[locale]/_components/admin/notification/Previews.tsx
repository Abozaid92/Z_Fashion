"use client";

import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { Bell, Zap, ChevronDown, ChevronUp, Smartphone } from "lucide-react";

type PreviewProps = {
  title: string;
  description: string;
  senderName: string;
  senderImage: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// PhonePreview — push notification on a phone lock screen
// ─────────────────────────────────────────────────────────────────────────────

export const PhonePreview = memo(function PhonePreview({
  title,
  description,
  senderName,
  senderImage,
}: PreviewProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("AdminPreviews" as any);

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
          <Smartphone size={14} className="text-slate-400" />
          {t("phone_preview")}
        </span>
        {open ?
          <ChevronUp size={13} className="text-slate-400" />
        : <ChevronDown size={13} className="text-slate-400" />}
      </button>

      {open && (
        <div className="mt-5 flex justify-center">
          <div className="w-52 bg-[#0f0f0f] rounded-[2.4rem] p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)]">
            <div className="bg-[#1a1a2e] rounded-[2rem] overflow-hidden">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-24 h-5 bg-black rounded-full shadow-inner" />
              </div>
              <div className="flex justify-between items-center px-5 pb-3">
                <span className="text-[11px] text-slate-400 font-semibold">
                  9:41
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-1.5 bg-white/30 rounded-sm overflow-hidden">
                    <div className="w-2/3 h-full bg-white/70 rounded-sm" />
                  </div>
                </div>
              </div>
              <div className="px-3 pb-5">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-3.5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className="flex items-start gap-2.5">
                    {senderImage ?
                      <img
                        src={senderImage}
                        alt={senderName}
                        className="w-8 h-8 rounded-[10px] object-cover shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      />
                    : <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(132,204,22,0.5)]">
                        <Zap size={13} className="text-white" />
                      </div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                          {senderName || "Admin"}
                        </span>
                        <span className="text-[8px] text-slate-300 shrink-0 ml-1">
                          {t("now")}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-900 leading-tight line-clamp-1">
                        {title || t("notification_title_placeholder")}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                        {description || t("message_placeholder")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// InAppPreview — bell icon dropdown inside a mock app navbar
// ─────────────────────────────────────────────────────────────────────────────

export const InAppPreview = memo(function InAppPreview({
  title,
  description,
  senderName,
  senderImage,
}: PreviewProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("AdminPreviews" as any);

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
          <Bell size={14} className="text-slate-400" />
          {t("in_app_preview")}
        </span>
        {open ?
          <ChevronUp size={13} className="text-slate-400" />
        : <ChevronDown size={13} className="text-slate-400" />}
      </button>

      {open && (
        <div className="mt-5">
          {/* ── Mock app frame ── */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60">
            {/* Navbar */}
            <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
              {/* Brand + nav links */}
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-md bg-gradient-to-br from-lime-400 to-emerald-500 shadow-[0_1px_4px_rgba(132,204,22,0.4)]" />
                <div className="flex gap-2.5">
                  <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
                  <div className="w-7 h-1.5 bg-slate-100 rounded-full" />
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
                </div>
              </div>

              {/* Bell with unread badge */}
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-lime-50 border border-lime-200 flex items-center justify-center shadow-[0_1px_4px_rgba(132,204,22,0.15)]">
                  <Bell size={13} className="text-lime-600" />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[7px] font-bold text-white leading-none">
                    1
                  </span>
                </span>
              </div>
            </div>

            {/* Page content — blurred lines to suggest page behind */}
            <div className="px-4 pt-3 pb-1 space-y-1.5 opacity-20 pointer-events-none select-none">
              <div className="h-2 w-3/4 bg-slate-400 rounded-full" />
              <div className="h-2 w-1/2 bg-slate-300 rounded-full" />
              <div className="h-2 w-2/3 bg-slate-300 rounded-full" />
            </div>

            {/* Notification dropdown — floats from the bell */}
            <div className="flex justify-end px-3 pb-4">
              <div className="w-full max-w-[210px] bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.13)] overflow-hidden">
                {/* Dropdown header */}
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                  <span className="text-[10px] font-extrabold text-slate-700 tracking-wide">
                    {t("notifications_label")}
                  </span>
                  <span className="text-[9px] font-bold text-lime-700 bg-lime-50 border border-lime-200 rounded-full px-1.5 py-0.5">
                    {t("new_count", { count: 1 })}
                  </span>
                </div>

                {/* Notification item — highlighted as unread */}
                <div className="px-3 py-2.5 bg-lime-50/60 border-b border-lime-100/60 flex items-start gap-2">
                  <div className="relative shrink-0">
                    {senderImage ?
                      <img
                        src={senderImage}
                        alt={senderName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white"
                      />
                    : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-[0_2px_6px_rgba(132,204,22,0.4)]">
                        <Zap size={11} className="text-white" />
                      </div>
                    }
                    {/* Unread dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-lime-400 rounded-full border-[1.5px] border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p className="text-[10px] font-bold text-slate-900 leading-tight line-clamp-1">
                        {title || t("notification_title_placeholder")}
                      </p>
                      <span className="text-[8px] text-slate-300 shrink-0 mt-px">
                        {t("now")}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-relaxed line-clamp-2">
                      {description || t("message_placeholder")}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="w-1 h-1 rounded-full bg-lime-400 shrink-0" />
                      <span className="text-[8px] text-slate-400 font-medium truncate">
                        {senderName || "Admin"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Empty state hint */}
                <div className="px-3.5 py-2 text-center">
                  <span className="text-[9px] text-slate-300 font-medium">
                    {t("no_other_notifications")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});
