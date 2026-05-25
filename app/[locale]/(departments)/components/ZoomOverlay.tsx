"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

interface ZoomOverlayProps {
  image: string;
  name: string;
  onClose: () => void;
}

export default function ZoomOverlay({
  image,
  name,
  onClose,
}: ZoomOverlayProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Zoom — ${name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <p className="max-w-[75%] truncate text-sm text-white/70">{name}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close zoom"
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Image */}
        <div
          className="overflow-hidden rounded-2xl bg-stone-100"
          style={{ touchAction: "none" }}
        >
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            centerOnInit
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent
                  wrapperStyle={{ width: "100%", display: "block" }}
                  contentStyle={{ width: "100%", display: "block" }}
                >
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-contain"
                      sizes="420px"
                      priority
                      draggable={false}
                    />
                  </div>
                </TransformComponent>

                {/* Controls */}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                  {(
                    [
                      { Icon: ZoomOut, label: "Zoom out", fn: zoomOut },
                      { Icon: RotateCcw, label: "Reset", fn: resetTransform },
                      { Icon: ZoomIn, label: "Zoom in", fn: zoomIn },
                    ] as const
                  ).map(({ Icon, label, fn }, i) => (
                    <>
                      {i > 0 && (
                        <div
                          key={`sep-${i}`}
                          className="mx-0.5 h-3.5 w-px bg-white/20"
                        />
                      )}
                      <button
                        key={label}
                        type="button"
                        onClick={() => fn()}
                        aria-label={label}
                        className="flex size-7 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      >
                        <Icon size={13} />
                      </button>
                    </>
                  ))}
                </div>
              </>
            )}
          </TransformWrapper>
        </div>

        <p className="text-center text-[11px] text-white/40">
          Pinch or scroll to zoom · Drag to pan
        </p>
      </div>
    </div>
  );
}
