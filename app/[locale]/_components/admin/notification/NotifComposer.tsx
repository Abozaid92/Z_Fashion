"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Role } from "@prisma/client";
import dynamic from "next/dynamic";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Zap,
  Bell,
  Smartphone,
  Link,
  ImageIcon,
  X,
  Loader2,
  Megaphone,
  Palette,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { cn } from "@/app/[locale]/_lib/utils";
import { Button } from "../ui/Button";
import { CreateGlobalNotificationSchema } from "@/app/api/utils/notificationSchema";
import { SenderAvatar } from "./NotifRow";
import { PhonePreview, InAppPreview } from "./Previews";
import { NotifHistory } from "./NotifHistory";
import {
  NotificationItem,
  CreateNotifPayload,
} from "@/app/[locale]/utils/admin/notifications/notitficationsTypes";
import { NotifFilters } from "./NotifFilter";
import {
  CreateNotifPayloadExtended,
  useCreateAnnouncementBar, // ← NEW
} from "@/hooks/useNotifications";

const HexColorPicker = dynamic(
  () => import("react-colorful").then((m) => ({ default: m.HexColorPicker })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[180px] rounded-xl bg-slate-100 animate-pulse" />
    ),
  },
);

const AnnouncementBarPreview = dynamic(
  () => import("./AnnouncementBarPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-16 rounded-xl bg-slate-100 animate-pulse" />
    ),
  },
);

const FormSchema = CreateGlobalNotificationSchema.pick({
  title: true,
  description: true,
}).extend({
  notificationTypes: z
    .array(z.enum(["IN_APP", "PUSH", "ANNOUNCEMENT_BAR"]))
    .min(1, "Select at least one delivery channel"),
  pushUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  pushImage: z.string().optional(),
  barColor: z.string().default("#e8f3ec"),
  barLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof FormSchema>;

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );
  formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
  formData.append("folder", "pushNotifications/promotions");

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error?.message ?? "فشل رفع الصورة إلى السحاب");
    }
    const data = await res.json();
    const transformation = "w_800,h_450,c_fill,g_auto,f_auto";
    const secureUrl = data.secure_url as string;
    return secureUrl.replace("/upload/", `/upload/${transformation}/`);
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
}

export const NotifComposer = memo(function NotifComposer({
  createNotif,
  isPending,
  isSuccess,
  isError,
  resetMutation,
  sessionName,
  sessionImage,
  notifications,
  isLoadingNotifs,
  notifCount,
}: {
  createNotif: (
    payload: CreateNotifPayloadExtended,
    options?: { onSuccess?: () => void },
  ) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  resetMutation: () => void;
  sessionName: string;
  sessionImage: string | null;
  notifications: NotificationItem[];
  isLoadingNotifs: boolean;
  notifCount: number | undefined;
}) {
  const t = useTranslations("AdminNotifComposer" as any);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // ── NEW: announcement bar mutation ────────────────────────────────────────
  const { mutate: createAnnouncementBar } = useCreateAnnouncementBar();
  // ─────────────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset: resetForm,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      notificationTypes: ["PUSH", "IN_APP"],
      pushUrl: "",
      pushImage: "",
      barColor: "#e8f3ec",
      barLink: "",
    },
  });

  const watchedTitle = watch("title");
  const watchedDescription = watch("description");
  const watchedTypes = watch("notificationTypes");
  const watchedPushImage = watch("pushImage");
  const watchedBarColor = watch("barColor");
  const watchedBarLink = watch("barLink");

  const isPushSelected = watchedTypes?.includes("PUSH");
  const isAnnouncementSelected = watchedTypes?.includes("ANNOUNCEMENT_BAR");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
      setIsUploading(true);
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });
        const url = await uploadToCloudinary(compressed as File);
        setValue("pushImage", url, { shouldValidate: true });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
        setPreviewUrl(null);
        setValue("pushImage", "", { shouldValidate: true });
      } finally {
        setIsUploading(false);
      }
    },
    [setValue],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: isUploading,
  });

  const clearImage = useCallback(() => {
    setPreviewUrl(null);
    setUploadError(null);
    setValue("pushImage", "", { shouldValidate: true });
  }, [setValue]);

  // ── onSubmit ──────────────────────────────────────────────────────────────
  const onSubmit = useCallback(
    (data: FormValues) => {
      const payload: CreateNotifPayloadExtended = {
        title: data.title,
        description: data.description,
        senderName: sessionName,
        senderImage: sessionImage ?? undefined,
        sender: Role.ADMIN,
        notificationType: data.notificationTypes,
        pushUrl: data.pushUrl || undefined,
        pushImage: data.pushImage || undefined,
        barColor: data.barColor || undefined,
        barLink: data.barLink || undefined,
      };

      const hasAnnouncement =
        data.notificationTypes.includes("ANNOUNCEMENT_BAR");
      const hasOtherTypes = data.notificationTypes.some(
        (t) => t !== "ANNOUNCEMENT_BAR",
      );

      const onSuccess = () => {
        resetForm();
        setPreviewUrl(null);
        setUploadError(null);
        setShowColorPicker(false);
        setTimeout(resetMutation, 4_000);
      };

      // ── NEW: route requests based on selected channels ──────────────────
      if (hasAnnouncement) {
        createAnnouncementBar(payload); // always fire announcement bar request
      }

      if (hasOtherTypes) {
        createNotif(payload, { onSuccess }); // fire normal notif if IN_APP or PUSH selected
      } else {
        // ANNOUNCEMENT_BAR only — reset form manually since createNotif won't fire
        onSuccess();
      }
      // ────────────────────────────────────────────────────────────────────
    },
    [
      createNotif,
      createAnnouncementBar,
      sessionName,
      sessionImage,
      resetForm,
      resetMutation,
    ],
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <section
        className="xl:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6 sm:p-7"
        aria-label={t("aria_label")}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-[0_2px_10px_rgba(132,204,22,0.3)]">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-extrabold text-slate-900 leading-none">
              {t("title")}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{t("subtitle")}</p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <SenderAvatar name={sessionName} image={sessionImage} />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-slate-800 truncate">
              {sessionName}
            </p>
            <p className="text-[10px] text-slate-400">
              {t("sending_as", { role: "Admin" })}
            </p>
          </div>
          <span className="text-[10px] font-bold text-lime-600 bg-lime-50 border border-lime-200 rounded-full px-2 py-0.5">
            {t("you")}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-[11px] font-extrabold text-slate-500 mb-3 uppercase tracking-widest">
            {t("notification_type")}
          </p>
          <div className="flex gap-3 flex-wrap">
            <label
              className={cn(
                "flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 select-none",
                watchedTypes?.includes("PUSH") ?
                  "border-lime-300 bg-lime-50 shadow-[0_0_0_1px_rgba(132,204,22,0.25)]"
                : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <input
                type="checkbox"
                value="PUSH"
                {...register("notificationTypes")}
                className="w-3.5 h-3.5 rounded accent-lime-500 shrink-0"
              />
              <div>
                <p
                  className={cn(
                    "text-[11px] flex gap-2 text-black font-bold",
                    watchedTypes?.includes("PUSH") ?
                      "text-lime-700"
                    : "text-slate-500",
                  )}
                >
                  {t("push_notification")}{" "}
                  <span>
                    <Smartphone size={12} />
                  </span>
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  {t("mobile_desktop")}
                </p>
              </div>
            </label>

            <label
              className={cn(
                "flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 select-none",
                watchedTypes?.includes("IN_APP") ?
                  "border-sky-300 bg-sky-50 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
                : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <input
                type="checkbox"
                value="IN_APP"
                {...register("notificationTypes")}
                className="w-3.5 h-3.5 rounded accent-sky-500 shrink-0"
              />
              <div>
                <p
                  className={cn(
                    "text-[11px] flex gap-2 font-bold",
                    watchedTypes?.includes("IN_APP") ?
                      "text-sky-700"
                    : "text-slate-500",
                  )}
                >
                  {t("in_app")}
                  <span>
                    <Bell size={12} />
                  </span>
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  {t("in_app_hint")}
                </p>
              </div>
            </label>

            <label
              className={cn(
                "flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 select-none",
                isAnnouncementSelected ?
                  "border-violet-300 bg-violet-50 shadow-[0_0_0_1px_rgba(139,92,246,0.25)]"
                : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <input
                type="checkbox"
                value="ANNOUNCEMENT_BAR"
                {...register("notificationTypes")}
                className="w-3.5 h-3.5 rounded accent-violet-500 shrink-0"
              />
              <div>
                <p
                  className={cn(
                    "text-[11px] flex gap-2 font-bold",
                    isAnnouncementSelected ? "text-violet-700" : (
                      "text-slate-500"
                    ),
                  )}
                >
                  {t("announcement_bar")}
                  <span>
                    <Megaphone size={12} />
                  </span>
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  {t("announcement_bar_hint")}
                </p>
              </div>
            </label>
          </div>

          {errors.notificationTypes && (
            <p className="text-[11px] text-rose-500 font-medium mt-2">
              {errors.notificationTypes.message}
            </p>
          )}
        </div>

        {isSuccess && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
            {t("notification_sent_success")}
          </div>
        )}
        {isError && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
            <AlertCircle size={15} className="shrink-0" />
            {t("notification_sent_error")}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="notif-title"
              className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest"
            >
              {t("notification_title")}{" "}
              <span className="text-rose-400 normal-case tracking-normal font-bold">
                *
              </span>
            </label>
            <input
              id="notif-title"
              type="text"
              placeholder={t("title_placeholder")}
              {...register("title")}
              className={cn(
                "w-full px-4 py-3 text-sm rounded-xl border bg-white text-slate-800 placeholder:text-slate-300 outline-none transition-all duration-200",
                "focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15",
                errors.title ?
                  "border-rose-300 bg-rose-50/30"
                : "border-slate-200 hover:border-slate-300",
              )}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.title ?
                <p className="text-[11px] text-rose-500 font-medium">
                  {errors.title.message}
                </p>
              : <span />}
              <p
                className={cn(
                  "text-[11px] tabular-nums",
                  (watchedTitle?.length ?? 0) > 80 ?
                    "text-amber-500"
                  : "text-slate-300",
                )}
              >
                {watchedTitle?.length ?? 0}/100
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="notif-desc"
              className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest"
            >
              {t("notification_description")}{" "}
              <span className="text-rose-400 normal-case tracking-normal font-bold">
                *
              </span>
            </label>
            <textarea
              id="notif-desc"
              rows={4}
              placeholder={t("description_placeholder")}
              {...register("description")}
              className={cn(
                "w-full px-4 py-3 text-sm rounded-xl border bg-white text-slate-800 placeholder:text-slate-300 outline-none transition-all duration-200 resize-none",
                "focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15",
                errors.description ?
                  "border-rose-300 bg-rose-50/30"
                : "border-slate-200 hover:border-slate-300",
              )}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.description ?
                <p className="text-[11px] text-rose-500 font-medium">
                  {errors.description.message}
                </p>
              : <span />}
              <p
                className={cn(
                  "text-[11px] tabular-nums",
                  (watchedDescription?.length ?? 0) > 1300 ?
                    "text-amber-500"
                  : "text-slate-300",
                )}
              >
                {watchedDescription?.length ?? 0}/1500
              </p>
            </div>
          </div>

          {isPushSelected && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-extrabold text-lime-600 uppercase tracking-widest bg-lime-50 border border-lime-200 rounded-full px-2.5 py-0.5">
                  {t("push_only")}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label
                    htmlFor="push-url"
                    className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest"
                  >
                    {t("action_url")}
                  </label>
                  <span className="text-[10px] text-slate-300 font-medium normal-case">
                    {t("push_only_hint")}
                  </span>
                </div>
                <div className="relative">
                  <Link
                    size={13}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                  />
                  <input
                    id="push-url"
                    type="url"
                    placeholder={t("push_url_placeholder")}
                    {...register("pushUrl")}
                    className={cn(
                      "w-full pl-9 pr-4 py-3 text-sm rounded-xl border bg-white text-slate-800 placeholder:text-slate-300 outline-none transition-all duration-200",
                      "focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15",
                      errors.pushUrl ?
                        "border-rose-300 bg-rose-50/30"
                      : "border-slate-200 hover:border-slate-300",
                    )}
                  />
                </div>
                {errors.pushUrl && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1.5">
                    {errors.pushUrl.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                    {t("notification_image")}
                  </label>
                  <span className="text-[10px] text-slate-300 font-medium normal-case">
                    {t("push_only_hint")}
                  </span>
                </div>
                <input type="hidden" {...register("pushImage")} />
                {previewUrl ?
                  <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={previewUrl}
                      alt={t("push_image_preview_alt")}
                      className="w-full h-36 object-cover"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center gap-2">
                        <Loader2
                          size={16}
                          className="animate-spin text-lime-500"
                        />
                        <span className="text-[11px] font-bold text-slate-600">
                          {t("uploading")}
                        </span>
                      </div>
                    )}
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-rose-50 hover:border-rose-300 transition-colors"
                      >
                        <X size={11} className="text-slate-500" />
                      </button>
                    )}
                    {!isUploading && watchedPushImage && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-100 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={9} />
                        <span className="text-gray-600">{t("uploaded")}</span>
                      </div>
                    )}
                  </div>
                : <div
                    {...getRootProps()}
                    className={cn(
                      "w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200",
                      isDragActive ?
                        "border-lime-400 bg-lime-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/60",
                    )}
                  >
                    <input {...getInputProps()} />
                    <ImageIcon
                      size={18}
                      className={cn(
                        "transition-colors",
                        isDragActive ? "text-lime-500" : "text-slate-300",
                      )}
                    />
                    <p className="text-[11px] font-medium text-slate-400">
                      {isDragActive ?
                        t("drop_to_upload")
                      : t("drag_click_to_choose")}
                    </p>
                    <p className="text-[10px] text-slate-300">
                      {t("file_types_hint")}
                    </p>
                  </div>
                }
                {uploadError && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1.5">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          )}

          {isAnnouncementSelected && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-200 rounded-full px-2.5 py-0.5">
                  {t("announcement_bar_only")}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label
                    htmlFor="bar-link"
                    className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest"
                  >
                    {t("bar_link_label")}
                  </label>
                  <span className="text-[10px] text-slate-300 font-medium normal-case">
                    {t("announcement_bar_hint")}
                  </span>
                </div>
                <div className="relative">
                  <Link
                    size={13}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                  />
                  <input
                    id="bar-link"
                    type="url"
                    placeholder={t("bar_link_placeholder")}
                    {...register("barLink")}
                    className={cn(
                      "w-full pl-9 pr-4 py-3 text-sm rounded-xl border bg-white text-slate-800 placeholder:text-slate-300 outline-none transition-all duration-200",
                      "focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15",
                      errors.barLink ?
                        "border-rose-300 bg-rose-50/30"
                      : "border-slate-200 hover:border-slate-300",
                    )}
                  />
                </div>
                {errors.barLink && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1.5">
                    {errors.barLink.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                    {t("bar_background_color")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowColorPicker((v) => !v)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-violet-300 transition-colors text-[10px] font-bold text-slate-500 hover:text-violet-600"
                  >
                    <Palette size={11} />
                    {showColorPicker ? t("close") : t("pick_color")}
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl border border-slate-200 shadow-inner flex-shrink-0 transition-colors duration-200"
                    style={{ background: watchedBarColor }}
                  />
                  <span className="text-[12px] font-mono font-bold text-slate-600 uppercase">
                    {watchedBarColor}
                  </span>
                </div>

                {showColorPicker && (
                  <Suspense
                    fallback={
                      <div className="w-full h-[180px] rounded-xl bg-slate-100 animate-pulse" />
                    }
                  >
                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <HexColorPicker
                        color={watchedBarColor}
                        onChange={(c) =>
                          setValue("barColor", c, { shouldValidate: true })
                        }
                        style={{ width: "100%", height: 180 }}
                      />
                    </div>
                  </Suspense>
                )}
              </div>

              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                {t("bar_preview")}
              </p>
              <Suspense
                fallback={
                  <div className="w-full h-11 rounded-xl bg-slate-100 animate-pulse" />
                }
              >
                <AnnouncementBarPreview
                  text={watchedTitle || t("announcement_placeholder")}
                  color={watchedBarColor}
                  link={watchedBarLink || undefined}
                />
              </Suspense>
            </div>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              variant="lime"
              size="md"
              fullWidth
              loading={isPending || isUploading}
              leftIcon={<Send size={13} />}
            >
              {isPending ? t("sending") : t("broadcast_to_all_users")}
            </Button>
            <p className="text-center text-[11px] text-slate-300 mt-2.5">
              {t("will_be_sent_to_users", { count: 7240 })}
            </p>
          </div>
        </form>
      </section>

      <div className="xl:col-span-2 space-y-5">
        <PhonePreview
          title={watchedTitle}
          description={watchedDescription}
          senderName={sessionName}
          senderImage={sessionImage}
        />
        <InAppPreview
          title={watchedTitle}
          description={watchedDescription}
          senderName={sessionName}
          senderImage={sessionImage}
        />
        <NotifFilters />
        <NotifHistory
          notifications={notifications}
          isLoading={isLoadingNotifs}
          notifCount={notifCount}
        />
      </div>
    </div>
  );
});
