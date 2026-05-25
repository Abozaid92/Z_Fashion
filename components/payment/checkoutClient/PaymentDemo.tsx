"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CartItemType } from "@/app/[locale]/utils/productType";
import {
  CreditCard,
  Lock,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  paymentSchema,
  type PaymentFormValues,
} from "@/app/[locale]/utils/paymentValidation";
import { OrderInput } from "@/app/api/utils/createOrderSchema";
import axios from "axios";
import { DOMAIN } from "@/lib/constants";
import { toast } from "react-toastify";
interface typeData {
  data: CartItemType[];
  success: boolean;
}
type Props = {
  data: typeData;
  totalAmount: number;
  onComplete: (data: PaymentFormValues) => void;
  onBack: () => void;
};
function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function getCardBrand(
  number: string,
): "visa" | "mastercard" | "amex" | "unknown" {
  const raw = number.replace(/\s/g, "");
  if (/^4/.test(raw)) return "visa";
  if (/^5[1-5]/.test(raw)) return "mastercard";
  if (/^3[47]/.test(raw)) return "amex";
  return "unknown";
}

// ── Card Brand SVGs (inline for zero-dependency) ─────────────────────────────
function VisaLogo() {
  return (
    <svg viewBox="0 0 48 16" className="h-5" aria-label="Visa">
      <text
        x="0"
        y="13"
        fontSize="14"
        fontWeight="800"
        fill="#1a1f71"
        fontFamily="Arial"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 36 24" className="h-5" aria-label="Mastercard">
      <circle cx="13" cy="12" r="10" fill="#eb001b" />
      <circle cx="23" cy="12" r="10" fill="#f79e1b" />
      <path d="M18 5.5a10 10 0 0 1 0 13 10 10 0 0 1 0-13z" fill="#ff5f00" />
    </svg>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white py-3 px-3.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 aria-[invalid=true]:border-red-400";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        {label} <span className="text-red-400">*</span>
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

export default function PaymentDemo({
  totalAmount,
  onComplete,
  onBack,
  data: dataInCart,
}: Props) {
  const t = useTranslations("PaymentDemo" as any);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
  });

  const brand = getCardBrand(cardNumber);
  const cardHolder = watch("cardHolder") ?? "";

  async function onSubmit(data: PaymentFormValues) {
    try {
      setIsProcessing(true);
      const dataCart = getDataInCart();

      await axios.post(`${DOMAIN}/api/products/order`, dataCart);
      onComplete({
        cardNumber: data.cardNumber,
        cardHolder: cardHolder,
        expiry: data.expiry,
        cvv: data.cvv,
      });
    } catch (error) {
      // console.log(error);
      toast.warning("some thing went wrong");
    } finally {
      setIsProcessing(false);
    }
  }

  function getDataInCart() {
    const dataCart = {
      status: "PROCESSING",
      items: dataInCart.data.map((el) => {
        return {
          size: el.size,
          productId: el.productId,
          quantity: el.quantity,
        };
      }),
      coupon: "",
    };

    return dataCart;
  }
  async function handlePayPal() {
    try {
      setPaypalLoading(true);
      const dataCart = getDataInCart();

      await axios.post(`${DOMAIN}/api/products/order`, dataCart);
      onComplete({
        cardNumber: "PAYPAL",
        cardHolder: "PayPal User",
        expiry: "00/00",
        cvv: "000",
      });
    } catch (error) {
      // console.log(error);
      toast.warning("some thing went wrong");
    } finally {
      setPaypalLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Visual Credit Card ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="relative h-44 w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-2xl select-none"
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -right-4 h-48 w-48 rounded-full bg-lime-400/10" />
        <div className="absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-emerald-400/10" />

        {/* Chip & brand */}
        <div className="flex items-start justify-between">
          <div className="h-8 w-11 rounded-md bg-gradient-to-br from-yellow-300 to-amber-400 shadow-sm" />
          <div className="mt-1">
            {brand === "visa" && <VisaLogo />}
            {brand === "mastercard" && <MastercardLogo />}
            {brand === "unknown" && (
              <CreditCard className="h-5 w-5 text-white/30" />
            )}
          </div>
        </div>

        {/* Number */}
        <div className="mt-4 font-mono text-lg tracking-[0.25em] text-white/90">
          {cardNumber ?
            cardNumber.padEnd(19, " ").replace(/\d(?=.{4,})/g, "·")
          : "•••• •••• •••• ••••"}
        </div>

        {/* Holder / Expiry */}
        <div className="mt-3 flex justify-between text-xs text-white/60">
          <span className="uppercase tracking-wider truncate max-w-[60%]">
            {cardHolder || "CARDHOLDER NAME"}
          </span>
          <span className="font-mono">{expiry || "MM/YY"}</span>
        </div>
      </div>

      {/* ── Card Form ────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label="Payment form"
        className="space-y-5"
      >
        <section
          aria-labelledby="card-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <CreditCard className="h-4 w-4 text-emerald-500" />
            <h2
              id="card-heading"
              className="text-sm font-bold uppercase tracking-widest text-slate-700"
            >
              {t("card_details")}
            </h2>
            <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
              <Lock className="h-3 w-3" />
              {t("secure")}
            </div>
          </div>

          {/* Card number */}
          <Field
            label={t("card_number")}
            htmlFor="cardNumber"
            error={errors.cardNumber?.message}
          >
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                maxLength={19}
                aria-invalid={!!errors.cardNumber}
                className={`${inputCls} pl-10 pr-12 font-mono tracking-wide`}
                {...register("cardNumber", {
                  onChange: (e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setCardNumber(formatted);
                    setValue("cardNumber", formatted, {
                      shouldValidate: false,
                    });
                  },
                })}
              />
              {brand !== "unknown" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {brand === "visa" && <VisaLogo />}
                  {brand === "mastercard" && <MastercardLogo />}
                </div>
              )}
            </div>
          </Field>

          {/* Cardholder */}
          <Field
            label={t("cardholder_name")}
            htmlFor="cardHolder"
            error={errors.cardHolder?.message}
          >
            <input
              id="cardHolder"
              type="text"
              autoComplete="cc-name"
              placeholder="Jane Smith"
              aria-invalid={!!errors.cardHolder}
              className={inputCls}
              {...register("cardHolder")}
            />
          </Field>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label={t("expiry")}
              htmlFor="expiry"
              error={errors.expiry?.message}
            >
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={expiry}
                  maxLength={5}
                  aria-invalid={!!errors.expiry}
                  className={`${inputCls} pl-9 font-mono`}
                  {...register("expiry", {
                    onChange: (e) => {
                      const formatted = formatExpiry(e.target.value);
                      setExpiry(formatted);
                      setValue("expiry", formatted, { shouldValidate: false });
                    },
                  })}
                />
              </div>
            </Field>

            <Field label={t("cvv")} htmlFor="cvv" error={errors.cvv?.message}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="cvv"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="•••"
                  maxLength={4}
                  aria-invalid={!!errors.cvv}
                  className={`${inputCls} pl-9 font-mono tracking-widest`}
                  {...register("cvv")}
                />
              </div>
            </Field>
          </div>
        </section>

        {/* ── Pay CTA ────────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 py-4 text-sm font-extrabold uppercase tracking-widest text-slate-900 shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] hover:shadow-emerald-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40"
          aria-busy={isProcessing}
        >
          {isProcessing ?
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("processing")}
            </span>
          : t("pay_button", { amount: totalAmount.toFixed(2) })}
        </button>
      </form>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-slate-200" />
        <span className="text-xs font-medium text-slate-400">{t("or")}</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {/* ── PayPal ───────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handlePayPal}
        disabled={paypalLoading}
        aria-label="Pay with PayPal"
        className="w-full cursor-pointer rounded-xl border-2 border-[#003087] bg-[#003087] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-[#002572] active:scale-[0.98] disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003087]/40"
      >
        {paypalLoading ?
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("redirecting")}
          </span>
        : <span className="flex items-center justify-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-current"
              aria-hidden="true"
            >
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.652h6.964c2.91 0 4.931.623 6.006 1.851 1.038 1.185 1.293 2.726.758 4.58-.031.107-.064.217-.099.329l-.008.025c-.64 2.143-2.053 3.43-4.205 3.826l-.09.016c-.19.033-.386.052-.583.061l-.151.004h-.455c-.304 0-.597.107-.824.302a1.07 1.07 0 0 0-.367.7l-.038.2-.637 4.044-.03.153a.639.639 0 0 1-.63.539H7.076v-.361zm12.48-13.3c-.012.07-.025.14-.04.212-.822 4.222-3.633 5.678-7.226 5.678H10.4c-.44 0-.814.32-.882.754l-.941 5.973-.267 1.692a.498.498 0 0 0 .493.576h3.457c.386 0 .714-.28.775-.661l.032-.167.614-3.894.039-.215a.785.785 0 0 1 .775-.661h.488c3.158 0 5.629-1.283 6.352-4.994.302-1.552.145-2.847-.654-3.759a3.12 3.12 0 0 0-.886-.534z" />
            </svg>
            {t("pay_with_paypal")}
          </span>
        }
      </button>

      {/* Trust & back */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("back_to_information")}
        </button>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          {t("ssl_secured")}
        </div>
      </div>
    </div>
  );
}
