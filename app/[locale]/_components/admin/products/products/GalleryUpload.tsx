// _components/admin/products/GalleryUpload.tsx
"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import {
  RiAddLine,
  RiCloseLine,
  RiArticleLine,
  RiDraggable,
  RiImageLine,
  RiGalleryLine,
} from "react-icons/ri";
import { cn } from "@/app/[locale]/_lib/utils";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const MAX_FILES = 8;
const MAX_SIZE_MB = 5;
const MAX_SIZE_B = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "image/avif": [], // الوحش الجديد بتاع الـ Lighthouse
  "image/heic": [], // امتداد صور الأيفون (iPhone High Efficiency)
  "image/heif": [], // نسخة تانية من صور الأيفون والموبايلات الحديثة
};

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface GalleryFile {
  file: File | string;
  preview: string;
  id: string;
}

interface GalleryUploadProps {
  value: (File | string)[];
  onChange: (files: (File | string)[]) => void;
  disabled?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export function GalleryUpload({
  value,
  onChange,
  disabled,
}: GalleryUploadProps) {
  const t = useTranslations("AdminGalleryUpload" as any);
  const [items, setItems] = useState<GalleryFile[]>(() =>
    value.map((file) => ({
      file,
      preview: typeof file === "string" ? file : URL.createObjectURL(file),
      id: Math.random().toString(36).slice(2),
    })),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // ── Sync ─────────────────────────────────────────────────
  const sync = (next: GalleryFile[]) => {
    setItems(next);
    onChange(next.map((i) => i.file));
  };

  // ── Drop ─────────────────────────────────────────────────
  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      const errs: string[] = [];

      rejected.forEach((r) => {
        const code = r.errors?.[0]?.code;
        if (code === "file-too-large")
          errs.push(`"${r.file.name}" exceeds ${MAX_SIZE_MB} MB.`);
        else if (code === "file-invalid-type")
          errs.push(`"${r.file.name}" is not a supported format.`);
        else errs.push(`"${r.file.name}" could not be added.`);
      });

      setErrors(errs);

      const remaining = MAX_FILES - items.length;
      const toAdd = accepted.slice(0, remaining);

      if (toAdd.length) {
        const next: GalleryFile[] = toAdd.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).slice(2),
        }));
        sync([...items, ...next]);
      }

      if (accepted.length > remaining) {
        setErrors((prev) => [...prev, `Max ${MAX_FILES} images allowed.`]);
      }
    },
    [items],
  );

  // ── Remove ───────────────────────────────────────────────
  const removeItem = (id: string) => {
    const next = items.filter((i) => {
      if (i.id === id) {
        if (typeof i.file !== "string") {
          URL.revokeObjectURL(i.preview);
        }
        return false;
      }
      return true;
    });
    sync(next);
    setErrors([]);
  };

  // ── Drag-to-reorder ──────────────────────────────────────
  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggingId) setDragOverId(id);
  };
  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    const from = items.findIndex((i) => i.id === draggingId);
    const to = items.findIndex((i) => i.id === targetId);
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    sync(next);
    setDraggingId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_SIZE_B,
    multiple: true,
    disabled: disabled || items.length >= MAX_FILES,
    noClick: items.length >= MAX_FILES,
  });

  const canAdd = items.length < MAX_FILES;

  return (
    <div className="space-y-3">
      {/* ── Drop zone ─────────────────────────────────────── */}
      <div
        {...getRootProps()}
        aria-label="Gallery images upload area"
        role="button"
        aria-describedby={errors.length ? "gallery-errors" : undefined}
        className={cn(
          "flex flex-col items-center justify-center gap-3 py-8 px-4",
          "rounded-2xl border-2 border-dashed transition-all duration-200",
          "outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2",
          !canAdd || disabled ?
            "border-slate-100 bg-slate-50/40 cursor-not-allowed opacity-60"
          : isDragActive ?
            "border-lime-400 bg-lime-50/60 scale-[1.005] shadow-md shadow-lime-100 cursor-copy"
          : "border-slate-200 bg-slate-50/40 cursor-pointer hover:border-lime-300 hover:bg-lime-50/20",
        )}
      >
        <input {...getInputProps()} aria-label="Upload gallery images" />

        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl transition-colors duration-200",
            isDragActive ?
              "bg-lime-100 text-lime-600"
            : "bg-slate-100 text-slate-400",
          )}
        >
          {isDragActive ?
            <RiImageLine size={20} />
          : <RiGalleryLine size={20} />}
        </div>

        <div className="text-center">
          <p
            className={cn(
              "text-sm font-semibold",
              isDragActive ? "text-lime-700" : "text-slate-600",
            )}
          >
            {!canAdd ?
              "Gallery full (8/8)"
            : isDragActive ?
              "Drop images here"
            : "Add gallery images"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {items.length}/{MAX_FILES} · JPG, PNG, WebP · Max {MAX_SIZE_MB} MB
            each
          </p>
        </div>
      </div>

      {/* ── Errors ─────────────────────────────────────────── */}
      {errors.length > 0 && (
        <ul
          id="gallery-errors"
          role="alert"
          aria-live="polite"
          className="space-y-1"
        >
          {errors.map((e, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-xs text-rose-600 font-medium"
            >
              <RiArticleLine size={12} className="shrink-0 mt-0.5" />
              {e}
            </li>
          ))}
        </ul>
      )}

      {/* ── Preview grid ───────────────────────────────────── */}
      {items.length > 0 && (
        <div
          className="grid grid-cols-3 sm:grid-cols-4 gap-2.5"
          aria-label="Gallery preview"
          role="list"
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              role="listitem"
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={() => handleDrop(item.id)}
              onDragEnd={handleDragEnd}
              aria-label={`Gallery image ${index + 1}: ${typeof item.file === "string" ? "Saved Image" : item.file.name}`}
              className={cn(
                "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 cursor-grab active:cursor-grabbing",
                draggingId === item.id ?
                  "opacity-40 scale-95 border-lime-300 shadow-none"
                : dragOverId === item.id ?
                  "border-lime-400 scale-[1.04] shadow-lg shadow-lime-100"
                : "border-slate-100 hover:border-slate-300 shadow-sm",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-150" />

              {/* Index badge */}
              <span className="absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-md bg-black/50 text-[10px] font-bold text-white backdrop-blur-sm tabular-nums">
                {index + 1}
              </span>

              {/* Drag handle */}
              <div className="absolute top-1.5 right-7 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="flex size-5 items-center justify-center rounded-md bg-black/50 text-white backdrop-blur-sm">
                  <RiDraggable size={11} />
                </div>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex size-5 items-center justify-center rounded-md bg-rose-500 hover:bg-rose-600 text-white"
              >
                <RiCloseLine size={11} />
              </button>
            </div>
          ))}

          {/* Add more slot */}
          {canAdd && (
            <div
              {...getRootProps()}
              role="button"
              aria-label="Add more gallery images"
              className={cn(
                "aspect-square rounded-xl border-2 border-dashed border-slate-200",
                "flex flex-col items-center justify-center gap-1.5",
                "cursor-pointer transition-all duration-150",
                "hover:border-lime-300 hover:bg-lime-50/30",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500",
              )}
            >
              <input {...getInputProps()} />
              <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-lime-100 group-hover:text-lime-600 transition-colors">
                <RiAddLine size={15} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Add
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
