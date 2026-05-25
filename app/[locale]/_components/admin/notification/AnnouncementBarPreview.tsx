"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

interface Props {
  text: string;
  color: string;
  link?: string;
}

/** Rendered inside a Suspense boundary — lazy loaded so react-colorful doesn't bloat the main bundle */
export default function AnnouncementBarPreview({ text, color, link }: Props) {
  const t = useTranslations("AdminAnnouncementBarPreview" as any);
  // Decide text colour: if the hex is "dark" use white, otherwise dark ink
  const isDark = isColorDark(color);
  const textColor = isDark ? "#ffffff" : "#1a2e22";
  const subColor = isDark ? "rgba(255,255,255,0.65)" : "rgba(26,46,34,0.55)";

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm"
      aria-label={t("aria_label")}
    >
      {/* label */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          {t("live_preview")}
        </span>
      </div>

      {/* bar */}
      <div
        className="w-full px-4 h-11 flex items-center justify-between gap-3 transition-colors duration-200"
        style={{ background: color }}
      >
        <span
          className="text-[11.5px] font-semibold tracking-wide truncate"
          style={{ color: textColor }}
        >
          {text}
        </span>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest underline-offset-2 hover:underline"
            style={{ color: textColor, opacity: 0.85 }}
          >
            {t("view_offer")} <ArrowRight size={9} strokeWidth={2.5} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── helper ────────────────────────────────────────────────────────────────────
function isColorDark(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // Perceived luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}
