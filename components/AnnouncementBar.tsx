"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { CSSProperties } from "react";

// 1. تعريف شكل البيانات القادمة من قاعدة البيانات (Prisma)
interface BarItem {
  id: string;
  title: string;
  description: string | null;
  barColor: string | null;
  barLink: string | null;
}

// 2. تعريف الـ Types الخاص بالثيم
interface ThemeColors {
  bg: string;
  text: string;
  border: string;
}

// دالة حساب التباين مع Typescript
const getTheme = (hex: string = "#e8f3ec"): ThemeColors => {
  // تنظيف الـ hex والتأكد من طوله
  const cleanHex = hex.startsWith("#") ? hex : `#${hex}`;
  const r = parseInt(cleanHex.slice(1, 3), 16) || 0;
  const g = parseInt(cleanHex.slice(3, 5), 16) || 0;
  const b = parseInt(cleanHex.slice(5, 7), 16) || 0;

  // معادلة السطوع (Luminance)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const isDark = brightness < 128;

  return {
    bg: cleanHex,
    text: isDark ? "#ffffff" : "#1a2e22",
    border: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
  };
};

export default function AnnouncementBar() {
  const [idx, setIdx] = useState<number>(0);
  const [show, setShow] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(true);

  // 3. استهلاك الكاش مع تمرير النوع <BarItem[]>
  const { data: bars = [] } = useQuery<BarItem[]>({
    queryKey: ["announcement"],
    staleTime: Infinity,
  });

  // التحكم في التنقل التلقائي
  useEffect(() => {
    if (bars.length < 2) return;
    const interval = setInterval(() => {
      move(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [bars.length, idx]);

  const move = (dir: number) => {
    setVisible(false);
    setTimeout(() => {
      setIdx((prev) => (prev + dir + bars.length) % bars.length);
      setVisible(true);
    }, 200);
  };

  // 4. استخراج العنصر الحالي وحساب الألوان
  const item = bars[idx];
  const theme = useMemo(() => getTheme(item?.barColor ?? undefined), [item]);

  // إخفاء الكومبوننت إذا لم توجد بيانات أو ضغط المستخدم على X
  if (!show || !bars.length || !item) return null;

  return (
    <section
      role="region"
      aria-label="Announcement Bar"
      className="w-full border-b transition-colors duration-500 ease-in-out select-none"
      style={
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
          color: theme.text,
        } as CSSProperties
      }
    >
      <div className="max-w-screen-xl mx-auto h-9 px-3 flex items-center justify-between text-[11px] sm:text-[12px] font-semibold tracking-tight">
        {/* Left Side: Dynamic Content */}
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: theme.text }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: theme.text }}
            />
          </span>

          <div
            className={`flex items-center gap-2 transition-all duration-300 transform ${
              visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
          >
            <p className="truncate max-w-[160px] sm:max-w-md uppercase">
              {item.title}
            </p>
            {item.barLink && (
              <a
                href={item.barLink}
                className="flex items-center gap-0.5 border-b border-current hover:opacity-70 transition-opacity"
              >
                SHOP <ArrowRight size={10} strokeWidth={3} />
              </a>
            )}
          </div>
        </div>

        {/* Right Side: Controls */}
        <div
          className="flex items-center gap-2 sm:gap-4 ml-2 border-l pl-2 sm:pl-4"
          style={{ borderColor: theme.border }}
        >
          {bars.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(-1)}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
                aria-label="Previous announcement"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => move(1)}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
                aria-label="Next announcement"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
          <button
            onClick={() => setShow(false)}
            className="hover:rotate-90 transition-transform duration-300 opacity-60 hover:opacity-100 p-1"
            aria-label="Close announcement"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
