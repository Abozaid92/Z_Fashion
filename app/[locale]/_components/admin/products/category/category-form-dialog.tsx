"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  FolderPlus,
  FolderOpen,
  Edit3,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/app/[locale]/_lib/utils";
import type { Category } from "@/hooks/use-categories-query";

// ─────────────────────────────────────────────────────────────
// Lazy load ImageUpload (react-dropzone loaded client-side only)
// ─────────────────────────────────────────────────────────────
const ImageUpload = dynamic(
  () => import("../products/ImageUpload").then((m) => m.ImageUpload),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] rounded-2xl bg-slate-100 animate-pulse" />
    ),
  },
);

// ─────────────────────────────────────────────────────────────
// Slug helper
// ─────────────────────────────────────────────────────────────
function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─────────────────────────────────────────────────────────────
// Cloudinary upload helper
// ─────────────────────────────────────────────────────────────
async function uploadToCloudinary(file: File): Promise<string> {
  // console.log("upload called");
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );
  formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
  formData.append("folder", "products");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Image upload failed");
  }
  const data = await res.json();
  return data.secure_url as string;
}

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────
const subSchema = z.object({
  name: z.string().min(2, "Min 2 chars"),
  slug: z
    .string()
    .min(2, "Min 2 chars")
    .regex(/^[a-z0-9-]+$/, "Lowercase, numbers and hyphens only"),
});

const createNewSchema = z.object({
  mode: z.literal("CREATE_NEW"),
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Min 2 chars")
    .regex(/^[a-z0-9-]+$/, "Lowercase, numbers and hyphens only"),
  image: z.string().optional(), // ✅ added
  children: z.array(subSchema).default([]),
});

const addExistingSchema = z.object({
  mode: z.literal("ADD_TO_EXISTING"),
  parentId: z.string().min(1, "Select parent category"),
  children: z.array(subSchema).min(1, "Add at least one sub-category"),
});

const editSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Min 2 chars")
    .regex(/^[a-z0-9-]+$/, "Lowercase, numbers and hyphens only"),
  image: z.string().nullable().optional(), // ✅ added
  parentId: z.string().nullable().optional(),
});

type CreateNewValues = z.infer<typeof createNewSchema>;
type AddExistingValues = z.infer<typeof addExistingSchema>;
type EditValues = z.infer<typeof editSchema>;

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
export type CategoryDialogMode =
  | { type: "create_new" }
  | { type: "add_to_existing"; parentId: string }
  | { type: "edit"; category: Category };

interface CategoryFormDialogProps {
  open: boolean;
  mode: CategoryDialogMode;
  rootCategories: Category[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
  error?: string | null;
}

// ─────────────────────────────────────────────────────────────
// Field component
// ─────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  hint,
  id,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-rose-400 normal-case text-xs">*</span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: boolean) =>
  cn(
    "w-full px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 bg-white",
    "border rounded-lg outline-none transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
    err ?
      "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10"
    : "border-slate-200 hover:border-slate-300 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15",
  );

// ─────────────────────────────────────────────────────────────
// useImageUpload — مشترك بين CreateNew و Edit
// بيرفع الصورة على كلوديناري فور ما المستخدم يختارها
// ─────────────────────────────────────────────────────────────
function useImageUpload(
  initialUrl: string | null | undefined,
  setValue: (key: any, val: any) => void,
  fieldName: string,
) {
  const [imageFile, setImageFile] = useState<File | string | null>(
    initialUrl ?? null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageChange = useCallback(
    async (file: File | null) => {
      setUploadError(null);
      if (!file) {
        setImageFile(null);
        setValue(fieldName, null);
        return;
      }
      // عرض الـ preview فوراً
      setImageFile(file);
      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(file);
        // استبدل الـ File بالـ URL بعد نجاح الرفع
        setImageFile(url);
        setValue(fieldName, url);
      } catch (err: any) {
        console.log(err);
        setUploadError(err?.message ?? "Upload failed");
        setImageFile(null);
        setValue(fieldName, null);
      } finally {
        setIsUploading(false);
      }
    },
    [fieldName, setValue],
  );

  return { imageFile, isUploading, uploadError, handleImageChange };
}

// ─────────────────────────────────────────────────────────────
// Create New Form
// ─────────────────────────────────────────────────────────────
function CreateNewForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: CreateNewValues) => void;
  isPending: boolean;
}) {
  const t = useTranslations("AdminCategories" as any);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateNewValues>({
    resolver: zodResolver(createNewSchema),
    defaultValues: {
      mode: "CREATE_NEW",
      name: "",
      slug: "",
      image: undefined,
      children: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  const [slugEdited, setSlugEdited] = useState(false);
  const watchedName = watch("name");

  useEffect(() => {
    if (!slugEdited)
      setValue("slug", toSlug(watchedName), { shouldDirty: false });
  }, [watchedName, slugEdited, setValue]);

  // ✅ Image upload hook
  const { imageFile, isUploading, uploadError, handleImageChange } =
    useImageUpload(undefined, setValue, "image");

  return (
    <form id="cat-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("mode")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={t("field_name")}
          id="cat-name"
          required
          error={errors.name?.message}
        >
          <input
            id="cat-name"
            type="text"
            placeholder={t("placeholder_example")}
            autoComplete="off"
            {...register("name")}
            className={inputCls(!!errors.name)}
          />
        </Field>
        <Field
          label={t("field_slug")}
          id="cat-slug"
          required
          error={errors.slug?.message}
          hint={t("auto_generated")}
        >
          <input
            id="cat-slug"
            type="text"
            placeholder={t("placeholder_slug")}
            {...register("slug")}
            onInput={() => setSlugEdited(true)}
            className={cn(inputCls(!!errors.slug), "font-mono text-[12px]")}
          />
        </Field>
      </div>

      {/* ✅ Image — root category only */}
      <Field label={t("field_image")} hint={t("field_image_hint")}>
        <ImageUpload
          value={imageFile}
          onChange={handleImageChange}
          disabled={isUploading || isPending}
        />
        {isUploading && (
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Loader2 size={11} className="animate-spin" />
            {t("uploading_image")}
          </p>
        )}
        {uploadError && (
          <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
            <AlertCircle size={11} />
            {uploadError}
          </p>
        )}
      </Field>

      {/* Sub-categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {t("sub_categories")}{" "}
            <span className="text-slate-300 normal-case">
              · {t("optional")}
            </span>
          </p>
          <button
            type="button"
            onClick={() => append({ name: "", slug: "" })}
            className="flex items-center gap-1.5 text-[12px] font-medium text-lime-600 hover:text-lime-700 transition-colors"
          >
            <Plus size={13} />
            {t("add_sub")}
          </button>
        </div>

        {fields.length > 0 && (
          <div className="space-y-2.5">
            {fields.map((field, index) => (
              <SubCategoryRow
                key={field.id}
                index={index}
                register={register}
                watch={watch}
                setValue={setValue}
                errors={(errors.children?.[index] as any) ?? {}}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        )}

        {fields.length === 0 && (
          <div className="flex items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-[12px] text-slate-400">
            {t("no_sub_categories")}
          </div>
        )}
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Add to Existing Form
// ─────────────────────────────────────────────────────────────
function AddToExistingForm({
  rootCategories,
  defaultParentId,
  onSubmit,
  isPending,
}: {
  rootCategories: Category[];
  defaultParentId: string;
  onSubmit: (data: AddExistingValues) => void;
  isPending: boolean;
}) {
  const t = useTranslations("AdminCategories" as any);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<AddExistingValues>({
    resolver: zodResolver(addExistingSchema),
    defaultValues: {
      mode: "ADD_TO_EXISTING",
      parentId: defaultParentId,
      children: [{ name: "", slug: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  return (
    <form id="cat-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("mode")} />

      <Field
        label={t("field_parent")}
        id="parentId"
        required
        error={errors.parentId?.message}
      >
        <select
          id="parentId"
          {...register("parentId")}
          className={inputCls(!!errors.parentId)}
        >
          <option value="">{t("select_parent")}</option>
          {rootCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Sub-categories
          </p>
          <button
            type="button"
            onClick={() => append({ name: "", slug: "" })}
            className="flex items-center gap-1.5 text-[12px] font-medium text-lime-600 hover:text-lime-700 transition-colors"
          >
            <Plus size={13} />
            {t("add")}
          </button>
        </div>
        {typeof errors.children?.message === "string" && (
          <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium mb-2">
            <AlertCircle size={11} />
            {errors.children.message}
          </p>
        )}
        <div className="space-y-2.5">
          {fields.map((field, index) => (
            <SubCategoryRow
              key={field.id}
              index={index}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={(errors.children?.[index] as any) ?? {}}
              onRemove={fields.length > 1 ? () => remove(index) : undefined}
            />
          ))}
        </div>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Edit Form
// ─────────────────────────────────────────────────────────────
function EditCategoryForm({
  category,
  rootCategories,
  onSubmit,
  isPending,
}: {
  category: Category;
  rootCategories: Category[];
  onSubmit: (data: EditValues) => void;
  isPending: boolean;
}) {
  const t = useTranslations("AdminCategories" as any);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image ?? null, // ✅ added
      parentId: category.parentId ?? null,
    },
  });

  const [slugEdited, setSlugEdited] = useState(false);
  const watchedName = watch("name");

  // ✅ is root = no parentId on the category being edited
  const isRoot = !category.parentId;

  useEffect(() => {
    if (!slugEdited)
      setValue("slug", toSlug(watchedName), { shouldDirty: false });
  }, [watchedName, slugEdited, setValue]);

  // ✅ Image upload hook — بيبدأ بالصورة الحالية لو موجودة
  const { imageFile, isUploading, uploadError, handleImageChange } =
    useImageUpload(category.image, setValue, "image");

  return (
    <form id="cat-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("id")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={t("field_name")}
          id="edit-name"
          required
          error={errors.name?.message}
        >
          <input
            id="edit-name"
            type="text"
            autoComplete="off"
            {...register("name")}
            className={inputCls(!!errors.name)}
          />
        </Field>
        <Field
          label={t("field_slug")}
          id="edit-slug"
          required
          error={errors.slug?.message}
          hint={t("editable")}
        >
          <input
            id="edit-slug"
            type="text"
            {...register("slug")}
            onInput={() => setSlugEdited(true)}
            className={cn(inputCls(!!errors.slug), "font-mono text-[12px]")}
          />
        </Field>
      </div>

      {/* ✅ Image — root category only */}
      {isRoot && (
        <Field label="Category Image" hint="Optional · shown on storefront">
          <ImageUpload
            value={imageFile}
            onChange={handleImageChange}
            disabled={isUploading || isPending}
          />
          {isUploading && (
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Loader2 size={11} className="animate-spin" />
              Uploading image…
            </p>
          )}
          {uploadError && (
            <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
              <AlertCircle size={11} />
              {uploadError}
            </p>
          )}
        </Field>
      )}

      <Field
        label={t("field_parent")}
        id="edit-parentId"
        hint={t("leave_empty_root")}
      >
        <select
          id="edit-parentId"
          {...register("parentId")}
          className={inputCls()}
        >
          <option value="">{t("no_parent_root")}</option>
          {rootCategories
            .filter((c) => c.id !== category.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </Field>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-category row (reused in create forms)
// ─────────────────────────────────────────────────────────────
function SubCategoryRow({
  index,
  register,
  watch,
  setValue,
  errors,
  onRemove,
}: {
  index: number;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemove?: () => void;
}) {
  const t = useTranslations("AdminCategories" as any);
  const [slugEdited, setSlugEdited] = useState(false);
  const watchedName = watch(`children.${index}.name`);

  useEffect(() => {
    if (!slugEdited)
      setValue(`children.${index}.slug`, toSlug(watchedName ?? ""), {
        shouldDirty: false,
      });
  }, [watchedName, slugEdited, index, setValue]);

  return (
    <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            placeholder={t("placeholder_sub_name")}
            autoComplete="off"
            {...register(`children.${index}.name`)}
            className={inputCls(!!errors?.name)}
          />
          {errors?.name && (
            <p className="text-[10px] text-rose-500 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder={t("placeholder_sub_slug")}
            {...register(`children.${index}.slug`)}
            onInput={() => setSlugEdited(true)}
            className={cn(inputCls(!!errors?.slug), "font-mono text-[12px]")}
          />
          {errors?.slug && (
            <p className="text-[10px] text-rose-500 mt-1">
              {errors.slug.message}
            </p>
          )}
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t("remove_sub_aria")}
          className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors mt-0.5 shrink-0"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────────────────────
export function CategoryFormDialog({
  open,
  mode,
  rootCategories,
  onClose,
  onSubmit,
  isPending,
  error,
}: CategoryFormDialogProps) {
  if (!open) return null;

  const isEdit = mode.type === "edit";
  const isAddExisting = mode.type === "add_to_existing";

  const t = useTranslations("AdminCategories" as any);

  const title =
    isEdit ? t("edit_title")
    : isAddExisting ? t("add_sub_title")
    : t("new_root_title");

  const icon =
    isEdit ? <Edit3 size={16} />
    : isAddExisting ? <FolderOpen size={16} />
    : <FolderPlus size={16} />;

  const iconBg =
    isEdit ? "bg-amber-100 text-amber-600" : "bg-lime-100 text-lime-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                iconBg,
              )}
            >
              {icon}
            </div>
            <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label={t("close_dialog")}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-[13px] text-rose-700 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {mode.type === "create_new" && (
            <CreateNewForm onSubmit={onSubmit} isPending={isPending} />
          )}
          {mode.type === "add_to_existing" && (
            <AddToExistingForm
              rootCategories={rootCategories}
              defaultParentId={mode.parentId}
              onSubmit={onSubmit}
              isPending={isPending}
            />
          )}
          {mode.type === "edit" && (
            <EditCategoryForm
              category={mode.category}
              rootCategories={rootCategories}
              onSubmit={onSubmit}
              isPending={isPending}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            form="cat-form"
            disabled={isPending}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-semibold rounded-xl transition-all",
              isPending ?
                "bg-lime-400 text-white cursor-pointer"
              : "bg-lime-500 hover:bg-lime-600 text-white shadow-sm shadow-lime-500/20",
            )}
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {isPending ?
              t("saving")
            : isEdit ?
              t("save_changes")
            : t("create")}
          </button>
        </div>
      </div>
    </div>
  );
}
