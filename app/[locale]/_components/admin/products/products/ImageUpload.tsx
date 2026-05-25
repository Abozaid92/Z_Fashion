"use client";

import { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import {
  RiUploadCloud2Line,
  RiImageLine,
  RiArticleLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiImageEditLine,
} from "react-icons/ri";
import { cn } from "@/app/[locale]/_lib/utils";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const MAX_SIZE_MB = 5;
const MAX_SIZE_B = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT_TYPES = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "image/avif": [], // الوحش الجديد بتاع الـ Lighthouse
  "image/heic": [], // امتداد صور الأيفون (iPhone High Efficiency)
  "image/heif": [], // نسخة تانية من صور الأيفون والموبايلات الحديثة
};
// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface ImageUploadProps {
  value: File | string | null; // بيقبل ملف أو رابط نصي
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const t = useTranslations("AdminImageUpload" as any);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 1. مراقبة الـ value وتحديث الـ preview
  useEffect(() => {
    // السطر ده عشانك أنت يا هندسة.. افتح الـ Console وشوف القيمة اللي بتطبع
    // console.log("ImageUpload Value:", value);

    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === "string") {
      // لو القيمة رابط (String) اعرضها فوراً
      setPreview(value);
    } else if (value instanceof File) {
      // لو القيمة ملف (File) اعمل له URL
      const url = URL.createObjectURL(value);
      setPreview(url);

      // تنظيف الذاكرة
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setError(null);

      if (rejected.length > 0) {
        const code = rejected[0]?.errors?.[0]?.code;
        if (code === "file-too-large")
          setError(`File exceeds the ${MAX_SIZE_MB} MB limit.`);
        else if (code === "file-invalid-type")
          setError("Only JPG, PNG, and WebP are accepted.");
        else setError("Invalid file. Please try again.");
        return;
      }

      if (accepted[0]) {
        onChange(accepted[0]);
      }
    },
    [onChange],
  );

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: ACCEPT_TYPES,
      maxSize: MAX_SIZE_B,
      maxFiles: 1,
      disabled,
    });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "relative group w-full rounded-2xl border-2 border-dashed outline-none transition-all duration-200 min-h-[200px] flex items-center justify-center",
          "focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          !preview &&
            !disabled && [
              isDragReject ? "border-rose-300 bg-rose-50/40 cursor-no-drop"
              : isDragActive ?
                "border-lime-400 bg-lime-50/50 scale-[1.01] shadow-lg shadow-lime-100/60 cursor-copy"
              : "border-slate-200 bg-slate-50/50 cursor-pointer hover:border-lime-300 hover:bg-lime-50/20",
            ],
          preview && "border-transparent bg-slate-50",
        )}
      >
        <input {...getInputProps()} />

        {/* ── المعاينة: لو فيه Preview هيظهر فوراً ── */}
        {preview ?
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
            <img
              src={preview}
              alt="Product preview"
              className="w-full h-full object-cover"
              onLoad={() => console.log("Image Loaded Successfully!")}
              onError={() =>
                console.error("Image Failed to Load! URL might be broken.")
              }
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex flex-col items-center justify-center gap-2">
              <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 flex flex-col items-center gap-2">
                <span className="flex items-center gap-1.5 bg-white text-slate-800 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg cursor-pointer">
                  <RiImageEditLine size={12} />
                  Change image
                </span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg transition-colors"
                >
                  <RiCloseLine size={12} />
                  Remove
                </button>
              </div>
            </div>

            {/* تفاصيل الملف تظهر فقط لو كان المرفق File */}
            {value instanceof File && (
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-white/50 rounded-lg px-2.5 py-1.5 shadow-sm">
                  <RiCheckboxCircleLine
                    size={11}
                    className="text-emerald-500 shrink-0"
                  />
                  <span className="text-[11px] font-medium text-slate-700 truncate">
                    {value.name}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-auto">
                    {formatBytes(value.size)}
                  </span>
                </div>
              </div>
            )}
          </div>
        : /* ── حالة فارغة ── */
          <div className="py-10 px-5 flex flex-col items-center gap-3 text-center select-none">
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl transition-colors duration-200",
                isDragActive ? "bg-lime-100 text-lime-600"
                : isDragReject ? "bg-rose-100 text-rose-500"
                : "bg-slate-100 text-slate-400 group-hover:bg-lime-100 group-hover:text-lime-600",
              )}
            >
              {isDragReject ?
                <RiArticleLine size={26} />
              : isDragActive ?
                <RiImageLine size={26} />
              : <RiUploadCloud2Line size={26} />}
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-semibold transition-colors",
                  isDragActive ? "text-lime-700"
                  : isDragReject ? "text-rose-600"
                  : "text-slate-700",
                )}
              >
                {isDragReject ?
                  "File type not supported"
                : isDragActive ?
                  "Drop to upload"
                : "Drag & drop or click to upload"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG, WebP · Max {MAX_SIZE_MB} MB
              </p>
            </div>
          </div>
        }
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <RiArticleLine size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
