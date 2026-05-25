"use client";

import { useTranslations } from "next-intl";
import { useEffect, useTransition, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2, MapPin, Mail, Phone, Truck } from "lucide-react";
import {
  addressSchema,
  type AddressFormValues,
} from "@/app/[locale]/utils/paymentValidation";
import { getStatesByCountry } from "@/app/[locale]/utils/paymentAction";
import { SHIPPING_METHODS } from "@/app/[locale]/utils/checkout";
import type { Country, State } from "@/app/[locale]/utils/checkout";

const STORAGE_KEY = "checkout_address_draft";

type Props = {
  countries: Country[];
  detectedCountry: string;
  initialStates: State[];
  defaultValues?: Partial<AddressFormValues>;
  onComplete: (data: AddressFormValues) => void;
};

// ── Reusable field wrapper ───────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Input base styles ────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-150 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-400/20";

const selectCls =
  "w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-9 text-sm text-slate-800 shadow-sm transition-all duration-150 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 aria-[invalid=true]:border-red-400 cursor-pointer";

export default function AddressForm({
  countries,
  detectedCountry,
  initialStates,
  defaultValues,
  onComplete,
}: Props) {
  const t = useTranslations("AddressForm" as any);
  const [states, setStates] = useState<State[]>(initialStates);
  const [isPending, startTransition] = useTransition();
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      shippingMethod: "standard",
      country: detectedCountry,
      ...defaultValues,
    },
  });

  const formValues = watch();
  const selectedCountry = watch("country");

  // 1. استرجاع البيانات المحفوظة بأمان
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const parsedData = JSON.parse(savedDraft);
        reset((prev) => ({ ...prev, ...parsedData }));
      }
    } catch (e) {
      // تم إزالة الطباعة في الـ Console للحفاظ على نظافة الكود
    } finally {
      setIsHydrated(true); // السماح بالحفظ التلقائي بعد انتهاء التحميل
    }
  }, [reset]);

  // 2. الحفظ التلقائي عند أي تغيير
  useEffect(() => {
    if (isHydrated && Object.keys(formValues).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formValues));
      } catch (e) {
        // Handle silently
      }
    }
  }, [formValues, isHydrated]);

  // 3. تحديث قائمة المحافظات بمجرد تغير البلد (بدون مسح القيمة المحفوظة)
  useEffect(() => {
    if (!selectedCountry) return;
    startTransition(async () => {
      const fetched = await getStatesByCountry(selectedCountry);
      setStates(fetched);
    });
  }, [selectedCountry]);

  const selectedCountryObj = countries.find((c) => c.code === selectedCountry);

  const handleFormSubmit = (data: AddressFormValues) => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    onComplete(data);
  };

  // فصل الـ onChange الخاص بالبلد لإضافة منطق تفريغ حقل المقاطعة عند التغيير اليدوي فقط
  const { onChange: onCountryChange, ...countryField } = register("country");

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      className="space-y-8"
      aria-label={t("aria_label")}
    >
      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="contact-heading">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 text-emerald-500" />
          <h2
            id="contact-heading"
            className="text-sm font-bold uppercase tracking-widest text-slate-700"
          >
            {t("contact")}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label={t("email_address")}
              htmlFor="email"
              error={errors.email?.message}
              required
            >
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("email_placeholder")}
                aria-invalid={!!errors.email}
                className={inputCls}
                {...register("email")}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field
              label={t("phone_number")}
              htmlFor="phone"
              error={errors.phone?.message}
              required
            >
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm whitespace-nowrap">
                  <span className="text-base leading-none">
                    {selectedCountryObj?.flag ?? "🌍"}
                  </span>
                  <span className="text-slate-500">
                    {selectedCountryObj?.dialCode ?? "+1"}
                  </span>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t("phone_placeholder")}
                    aria-invalid={!!errors.phone}
                    className={`${inputCls} pl-9`}
                    {...register("phone")}
                  />
                </div>
              </div>
            </Field>
          </div>
        </div>
      </section>

      {/* ── Shipping Address ─────────────────────────────────────────────── */}
      <section aria-labelledby="address-heading">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-500" />
          <h2
            id="address-heading"
            className="text-sm font-bold uppercase tracking-widest text-slate-700"
          >
            {t("shipping_address")}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Country */}
          <div className="sm:col-span-2">
            <Field
              label={t("country")}
              htmlFor="country"
              error={errors.country?.message}
              required
            >
              <div className="relative">
                <select
                  id="country"
                  aria-invalid={!!errors.country}
                  className={selectCls}
                  {...countryField}
                  onChange={(e) => {
                    onCountryChange(e); // تحديث القيمة في React Hook Form
                    setValue("state", ""); // مسح المقاطعة فقط عند تدخل المستخدم لتغيير البلد
                  }}
                >
                  <option value="">{t("select_country")}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </Field>
          </div>

          {/* First / Last */}
          <Field
            label={t("first_name")}
            htmlFor="firstName"
            error={errors.firstName?.message}
            required
          >
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder={t("first_name_placeholder")}
              aria-invalid={!!errors.firstName}
              className={inputCls}
              {...register("firstName")}
            />
          </Field>

          <Field
            label={t("last_name")}
            htmlFor="lastName"
            error={errors.lastName?.message}
            required
          >
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder={t("last_name_placeholder")}
              aria-invalid={!!errors.lastName}
              className={inputCls}
              {...register("lastName")}
            />
          </Field>

          {/* Street */}
          <div className="sm:col-span-2">
            <Field
              label={t("street_address")}
              htmlFor="address"
              error={errors.address?.message}
              required
            >
              <input
                id="address"
                type="text"
                autoComplete="street-address"
                placeholder={t("street_placeholder")}
                aria-invalid={!!errors.address}
                className={inputCls}
                {...register("address")}
              />
            </Field>
          </div>

          {/* Apartment */}
          <div className="sm:col-span-2">
            <Field
              label={t("apartment_optional")}
              htmlFor="apartment"
              error={errors.apartment?.message}
            >
              <input
                id="apartment"
                type="text"
                autoComplete="address-line2"
                placeholder={t("apartment_placeholder")}
                className={inputCls}
                {...register("apartment")}
              />
            </Field>
          </div>

          {/* City */}
          <Field
            label={t("city")}
            htmlFor="city"
            error={errors.city?.message}
            required
          >
            <input
              id="city"
              type="text"
              autoComplete="address-level2"
              placeholder={t("city_placeholder")}
              aria-invalid={!!errors.city}
              className={inputCls}
              {...register("city")}
            />
          </Field>

          {/* Postal */}
          <Field
            label={t("postal_code")}
            htmlFor="postalCode"
            error={errors.postalCode?.message}
            required
          >
            <input
              id="postalCode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder={t("postal_placeholder")}
              aria-invalid={!!errors.postalCode}
              className={inputCls}
              {...register("postalCode")}
            />
          </Field>

          {/* State / Governorate */}
          <div className="sm:col-span-2">
            <Field
              label={t("state_governorate")}
              htmlFor="state"
              error={errors.state?.message}
              required
            >
              <div className="relative">
                {isPending && (
                  <Loader2 className="absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-400" />
                )}
                <select
                  id="state"
                  aria-invalid={!!errors.state}
                  aria-busy={isPending}
                  disabled={isPending || states.length === 0}
                  className={`${selectCls} disabled:cursor-not-allowed disabled:opacity-50`}
                  {...register("state")}
                >
                  <option value="">
                    {isPending ?
                      t("loading")
                    : states.length === 0 ?
                      t("select_country_first")
                    : t("select_state")}
                  </option>
                  {states.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </Field>
          </div>
        </div>
      </section>

      {/* ── Shipping Method ──────────────────────────────────────────────── */}
      <section aria-labelledby="shipping-heading">
        <div className="mb-4 flex items-center gap-2">
          <Truck className="h-4 w-4 text-emerald-500" />
          <h2
            id="shipping-heading"
            className="text-sm font-bold uppercase tracking-widest text-slate-700"
          >
            Shipping Method
          </h2>
        </div>

        <Controller
          name="shippingMethod"
          control={control}
          render={({ field }) => (
            <fieldset
              aria-describedby={
                errors.shippingMethod ? "shipping-error" : undefined
              }
            >
              <legend className="sr-only">Choose shipping method</legend>
              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                  const checked = field.value === method.id;
                  return (
                    <label
                      key={method.id}
                      htmlFor={`shipping-${method.id}`}
                      className={[
                        "flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200",
                        checked ?
                          "border-emerald-400 bg-gradient-to-r from-lime-50 to-emerald-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
                          checked ?
                            "border-emerald-500 bg-emerald-500"
                          : "border-slate-300",
                        ].join(" ")}
                      >
                        {checked && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>

                      <input
                        type="radio"
                        id={`shipping-${method.id}`}
                        value={method.id}
                        checked={checked}
                        onChange={() => field.onChange(method.id)}
                        className="sr-only"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {method.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {method.description}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-sm font-bold ${
                            checked ? "text-emerald-600" : "text-slate-700"
                          }`}
                        >
                          {method.price === 0 ?
                            "Free"
                          : `$${method.price.toFixed(2)}`}
                        </p>
                        <p className="text-xs text-slate-400">{method.eta}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.shippingMethod && (
                <p
                  id="shipping-error"
                  role="alert"
                  className="mt-2 text-xs text-red-500"
                >
                  {errors.shippingMethod.message}
                </p>
              )}
            </fieldset>
          )}
        />
      </section>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <button
        type="submit"
        className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 py-4 text-sm font-extrabold uppercase tracking-widest text-slate-900 shadow-lg shadow-emerald-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-emerald-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40"
      >
        {t("continue_to_payment")}
      </button>
    </form>
  );
}
