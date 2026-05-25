"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

interface Props {
  image: string;
  name: string;
  onClose: () => void;
}

export default function ZoomOverlay({ image, name, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // التأكد من أن المكون تم تحميله في المتصفح (Client-side)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // التحكم في لوحة المفاتيح وقفل السكرول
  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // قفل السكرول بتاع الصفحة
    rootRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = ""; // إرجاع السكرول عند الغلق
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={rootRef}
      tabIndex={-1}
      className="fixed inset-0 z-[9999] flex items-center justify-center outline-none"
      role="dialog"
      aria-modal="true"
    >
      {/* الخلفية المعتمة */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* زر الغلق (ثابت في الزاوية) */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-[10000] flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
      >
        <X size={24} />
      </button>

      {/* محتوى الصورة والزووم */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit={true}
          doubleClick={{ mode: "reset" }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div className="flex flex-col items-center gap-6 w-full h-full justify-center">
              {/* الحاوية الرئيسية للصورة - هنا التعديل الجوهري */}
              <TransformComponent
                wrapperClass="!w-screen !h-[80vh] flex items-center justify-center"
                contentClass="flex items-center justify-center"
              >
                <div className="relative w-[90vw] h-[70vh] max-w-5xl">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-contain transition-transform duration-200"
                    draggable={false}
                    priority
                    sizes="100vw"
                  />
                </div>
              </TransformComponent>

              {/* أزرار التحكم (Floating Toolbar) */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white shadow-2xl">
                <button
                  onClick={() => zoomOut()}
                  className="hover:text-emerald-400 transition-colors p-1"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>

                <div className="w-[1px] h-4 bg-white/20" />

                <button
                  onClick={() => resetTransform()}
                  className="hover:text-emerald-400 transition-colors p-1"
                  title="Reset"
                >
                  <RotateCcw size={20} />
                </button>

                <div className="w-[1px] h-4 bg-white/20" />

                <button
                  onClick={() => zoomIn()}
                  className="hover:text-emerald-400 transition-colors p-1"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
              </div>
            </div>
          )}
        </TransformWrapper>
      </div>
    </div>,
    document.body,
  );
}
