"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { z } from "zod";
import {
  X,
  Save,
  Loader2,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Package,
  Image as ImageIcon,
  GalleryHorizontal,
  Shirt,
} from "lucide-react";
import { cn } from "@/app/[locale]/_lib/utils";

// Types
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/hooks/use-products-query";
import type { Category } from "@/hooks/use-categories-query";

// Isolated Components
import { SectionLabel, Field, ChipGroup } from "./ProductFormShared";
import { ProductBasicInfo } from "./ProductBasicInfo";
import { ProductPricing } from "./ProductPricing";

// ─────────────────────────────────────────────────────────────
// Constants & Utils
// ─────────────────────────────────────────────────────────────
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "kids", label: "Kids" },
  { value: "unisex", label: "Unisex" },
] as const;

const SIZE_OPTIONS = [
  { value: "Small", label: "S" },
  { value: "Medium", label: "M" },
  { value: "Large", label: "L" },
  { value: "XLarge", label: "XL" },
] as const;

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function flattenCategories(
  categories: Category[],
  depth = 0,
): {
  id: string;
  parentId: string | null | undefined;
  name: string;
  slug: string;
  depth: number;
}[] {
  const result: {
    id: string;
    parentId: string | null | undefined;
    name: string;
    slug: string;
    depth: number;
  }[] = [];
  for (const cat of categories) {
    if (!cat.parentId) {
      result.push({
        id: cat.id,
        parentId: cat.parentId,
        name: cat.name,
        slug: cat.slug,
        depth,
      });
    }
  }

  // console.log("this is catgorty befroe fklat ", categories);
  const children = categories.flatMap((el) => el.children) || [];
  // console.log("this is chuldren ", children);

  for (const child of children) {
    if (child.parentId) {
      result.push({
        id: child.id,
        name: child.name,
        slug: child.slug,
        parentId: child.parentId,
        depth: depth + 1,
      });
    }
  }

  // console.log("this is the flattened categories resultttttttttttttt", result);
  return result;
}

async function uploadToCloudinary(file: File): Promise<string> {
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
// Zod Schema
// ─────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  price: z
    .number({ invalid_type_error: "Enter a valid price" })
    .int("Must be a whole number")
    .positive("Must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().min(1, "sub  Category is required"),
  brand: z.string().optional(),
  gender: z.array(z.enum(["male", "female", "kids", "unisex"])).default([]),
  size: z.array(z.enum(["Small", "Medium", "Large", "XLarge"])).default([]),
  inStock: z.boolean().default(true),
  countStock: z.number().int().nonnegative().optional(),
  discount: z.number().int().min(0).max(100).default(0),
  slug: z.string().min(2, "Slug is required"),
});

type FormValues = z.infer<typeof productSchema>;

const ImageUpload = dynamic(
  () => import("./ImageUpload").then((m) => ({ default: m.ImageUpload })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square rounded-xl bg-slate-100 animate-pulse flex items-center justify-center">
        <ImageIcon className="text-slate-300" size={24} />
      </div>
    ),
  },
);

const GalleryUpload = dynamic(
  () => import("./GalleryUpload").then((m) => ({ default: m.GalleryUpload })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-28 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center">
        <GalleryHorizontal className="text-slate-300" size={20} />
      </div>
    ),
  },
);

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
interface ProductFormSheetProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSubmit: (data: CreateProductInput | UpdateProductInput) => void;
  isPending: boolean;
  error?: string | null;
}

export function ProductFormSheet({
  open,
  onClose,
  product,
  categories,
  onSubmit,
  isPending,
  error,
}: ProductFormSheetProps) {
  const isEdit = !!product;
  const t = useTranslations("AdminProductForm" as any);

  // 1. التعديل هنا: سمحنا للـ state إنها تاخد رابط (string) أو ملف (File)
  const [mainImage, setMainImage] = useState<File | string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(File | string)[]>([]);

  const [slugEdited, setSlugEdited] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");

  const flatCategories = useMemo(
    () => flattenCategories(categories),
    [categories],
  );
  const formValues = useMemo(() => {
    if (!open) return undefined;
    const ctgIdForPrent = flatCategories.filter(
      (el) => el.parentId && el.parentId === product?.categoryId,
    )[0];
    return {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      categoryId: ctgIdForPrent?.id ?? "",
      subCategoryId: product?.categoryId ?? "",
      brand: product?.brand ?? "",
      gender: (product?.gender as any) ?? [],
      size: (product?.size as any) ?? [],
      inStock: product?.inStock ?? true,
      countStock: product?.countStock ?? undefined,
      discount: product?.discount ?? 0,
      slug: product?.slug ?? "",
    };
  }, [open, product]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    values: formValues,
  });

  // 2. التعديل الجوهري: مزامنة الصور مع البيانات اللي جاية من الداتابيز عند الفتح
  useEffect(() => {
    if (open && product) {
      setMainImage(product.image || null);
      setGalleryImages(product.gallery || []);
    } else if (!open) {
      setMainImage(null);
      setGalleryImages([]);
      setSlugEdited(false);
      setUploadError(null);
    }
  }, [open, product]);

  const watchedName = watch("name");
  const watchedPrice = watch("price");
  const watchedDiscount = watch("discount");
  const watchedInStock = watch("inStock");
  const watchedGender = (watch("gender") ?? []) as string[];
  const watchedSize = (watch("size") ?? []) as string[];

  useEffect(() => {
    if (!slugEdited && !isEdit && watchedName) {
      setValue("slug", toSlug(watchedName), { shouldDirty: false });
    }
  }, [watchedName, slugEdited, isEdit, setValue]);

  const toggleGender = (v: string) => {
    const next =
      watchedGender.includes(v) ?
        watchedGender.filter((x) => x !== v)
      : [...watchedGender, v];
    setValue("gender", next as any, { shouldDirty: true });
  };

  const toggleSize = (v: string) => {
    const next =
      watchedSize.includes(v) ?
        watchedSize.filter((x) => x !== v)
      : [...watchedSize, v];
    setValue("size", next as any, { shouldDirty: true });
  };

  const discountedPrice =
    watchedDiscount > 0 ?
      (watchedPrice * (1 - watchedDiscount / 100)).toFixed(0)
    : null;

  const handleFormSubmit = async (formData: FormValues) => {
    setUploadError(null);
    if (!isEdit && !mainImage) {
      setUploadError("A main product image is required.");
      return;
    }
    try {
      // 3. تعديل منطق الرفع: نرفع فقط لو كان المرفق "File" وليس "string"
      let imageUrl =
        typeof mainImage === "string" ? mainImage : (product?.image ?? "");
      let galleryUrls: string[] = galleryImages.filter(
        (img) => typeof img === "string",
      ) as string[];

      if (mainImage instanceof File) {
        setIsUploading(true);
        setUploadStep(t("uploading_main"));
        imageUrl = await uploadToCloudinary(mainImage);
      }

      const newGalleryFiles = galleryImages.filter(
        (img) => img instanceof File,
      ) as File[];
      if (newGalleryFiles.length > 0) {
        setIsUploading(true);
        setUploadStep(
          t("uploading_gallery", { count: newGalleryFiles.length }),
        );
        const uploaded = await Promise.all(
          newGalleryFiles.map(uploadToCloudinary),
        );
        galleryUrls = [...galleryUrls, ...uploaded];
      }

      setIsUploading(false);
      setUploadStep("");

      if (isEdit && product) {
        onSubmit({
          id: product.id,
          ...formData,
          image: imageUrl,
          gallery: galleryUrls,
        } as UpdateProductInput);
      } else {
        onSubmit({
          ...formData,
          image: imageUrl,
          gallery: galleryUrls,
        } as CreateProductInput);
      }
    } catch (err: any) {
      setIsUploading(false);
      setUploadStep("");
      setUploadError(err?.message ?? t("upload_failed"));
    }
  };

  const isLoading = isPending || isUploading;
  const btnLabel =
    isUploading ? uploadStep || t("uploading_main")
    : isPending ?
      isEdit ? t("save_changes")
      : t("create_product")
    : isEdit ? t("save_changes")
    : t("create_product");

  if (!open) return null;

  // console.log("this is categories in form sheet", categories);
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      <div
        className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-2xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 transform-gpu ease-out"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-lime-100 text-lime-600">
              <Package size={16} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                {isEdit ? t("edit_title") : t("new_title")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEdit ?
                  t("editing", { name: product?.name })
                : t("fill_in_details")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {(error || uploadError) && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-[13px] text-rose-700 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              {error ?? uploadError}
            </div>
          )}
          {isUploading && (
            <div className="flex items-center gap-3 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl text-[13px] text-sky-800 font-medium">
              <UploadCloud size={16} className="shrink-0 animate-pulse" />
              {uploadStep}
            </div>
          )}

          <form
            id="product-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="space-y-6"
          >
            <ProductBasicInfo
              register={register}
              errors={errors}
              flatCategories={flatCategories}
              setSlugEdited={setSlugEdited}
            />

            <section>
              <SectionLabel
                icon={<ImageIcon size={14} />}
                title={t("main_image")}
                subtitle={isEdit ? t("current_image_shown") : t("required")}
              />
              {/* 4. هنا الـ value بقت شايلة الـ product.image فعلاً عند الفتح */}
              <ImageUpload value={mainImage} onChange={setMainImage} />
            </section>

            <section>
              <SectionLabel
                icon={<GalleryHorizontal size={14} />}
                title={t("gallery")}
                subtitle={t("gallery_count", { count: galleryImages.length })}
              />
              <GalleryUpload
                value={galleryImages}
                onChange={setGalleryImages}
              />
            </section>

            <section>
              <SectionLabel
                icon={<Shirt size={14} />}
                title={t("variants")}
                subtitle={`${t("gender")} & ${t("sizes")}`}
              />
              <div className="space-y-5">
                <Field label={t("gender")}>
                  <ChipGroup
                    options={GENDER_OPTIONS}
                    selected={watchedGender}
                    onToggle={toggleGender}
                  />
                </Field>
                <Field label={t("sizes")}>
                  <ChipGroup
                    options={SIZE_OPTIONS}
                    selected={watchedSize}
                    onToggle={toggleSize}
                  />
                </Field>
              </div>
            </section>

            <ProductPricing
              register={register}
              errors={errors}
              setValue={setValue}
              watchedPrice={watchedPrice}
              watchedDiscount={watchedDiscount}
              watchedInStock={watchedInStock}
              discountedPrice={discountedPrice}
            />
          </form>
        </div>

        <div className="shrink-0 flex items-center gap-3 px-5 sm:px-6 py-4 border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none sm:w-28 py-2.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isLoading}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold rounded-xl transition-all",
              isLoading ?
                "bg-lime-400 text-white cursor-pointer"
              : "bg-lime-500 hover:bg-lime-600 text-white shadow-sm shadow-lime-500/20",
            )}
          >
            {isUploading ?
              <UploadCloud size={14} className="animate-pulse" />
            : isLoading ?
              <Loader2 size={14} className="animate-spin" />
            : <Save size={14} />}
            {btnLabel}
          </button>
        </div>
      </div>
    </>
  );
}
