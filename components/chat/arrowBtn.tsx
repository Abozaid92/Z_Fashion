// components/ScrollToBottomButton.tsx
"use client";

import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { forwardRef } from "react";

interface ScrollToBottomButtonProps {
  onClick: () => void;
  // ضفت الـ style هنا عشان لو بتبعت الـ transform أو الـ opacity برمجياً
  style?: React.CSSProperties;
}

const ScrollToBottomButton = forwardRef<
  HTMLButtonElement,
  ScrollToBottomButtonProps
>(({ onClick, style }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      title="Scroll to bottom"
      style={style}
      className="fixed bottom-24 right-10 z-50 h-11 w-11 rounded-full bg-emerald-50 border border-emerald-500/20 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] group outline-none cursor-pointer 
      /* التعديل السحري للسنترة */
      flex items-center justify-center p-0 overflow-hidden"
    >
      <ArrowDown
        className="text-emerald-500 w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5"
        strokeWidth={3} // زودت الـ thickness عشان يبان بروفيشنال أكتر
      />
    </button>
  );
});

ScrollToBottomButton.displayName = "ScrollToBottomButton";

export default ScrollToBottomButton;
