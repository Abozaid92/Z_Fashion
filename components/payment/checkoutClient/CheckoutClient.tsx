"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import CheckoutStepper from "./CheckoutStepper";
import AddressForm from "./AddressForm";
import PaymentDemo from "./PaymentDemo";
import OrderSummary from "./OrderSummary";
import SuccessScreen from "./SuccessScreen";
import type {
  Country,
  State,
  CheckoutStep,
  AddressData,
} from "@/app/[locale]/utils/checkout";
import type { AddressFormValues } from "@/app/[locale]/utils/paymentValidation";
import type { PaymentFormValues } from "@/app/[locale]/utils/paymentValidation";
import { SHIPPING_METHODS } from "@/app/[locale]/utils/checkout";
import useGetItemsInCart from "@/hooks/getItemsInCart";
import Applyrequest from "@/components/cart/applyrequest";
import PaymentHeader from "./PaymentHeader";

type Props = {
  countries: Country[];
  detectedCountry: string;
  initialStates: State[];
};

export default function CheckoutClient({
  countries,
  detectedCountry,
  initialStates,
}: Props) {
  const t = useTranslations("Checkout" as any);
  const { data, isLoading } = useGetItemsInCart();
  const initialData = data?.data || [];
  const [step, setStep] = useState<CheckoutStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [orderNumber] = useState(() => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ORD-${ts}-${rand}`;
  });

  const selectedShipping = (addressData?.shippingMethod ??
    "standard") as AddressData["shippingMethod"];

  const totalAmount = useMemo(() => {
    const subtotal = initialData.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
    const shipping =
      SHIPPING_METHODS.find((m) => m.id === selectedShipping)?.price ?? 0;
    const tax = (subtotal + shipping) * 0.08;
    return subtotal + shipping + tax;
  }, [selectedShipping]);

  function completeStep(n: number) {
    setCompletedSteps((prev) => new Set([...prev, n]));
  }

  function handleAddressComplete(data: AddressFormValues) {
    setAddressData(data as AddressData);
    completeStep(1);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePaymentComplete(_data: PaymentFormValues) {
    completeStep(2);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const showSummary = step < 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <PaymentHeader step={step} completedSteps={completedSteps} />
      <main
        id="main-content"
        className="mx-auto max-w-5xl px-4 py-8"
        aria-label={t("aria_label")}
      >
        {/* Mobile summary */}
        {showSummary && (
          <div className="mb-6 lg:hidden">
            <Applyrequest data={initialData as any} showOrderItem={true} />
            {/* <OrderSummary selectedShipping={selectedShipping} isMobile /> */}
          </div>
        )}

        {step < 3 ?
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
            {/* ── Left: Form ───────────────────────────────────────────── */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Step header */}
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">
                    Step {step} of 2
                  </p>
                  <h1 className="mt-1 text-xl font-extrabold text-slate-900">
                    {step === 1 ? t("your_information") : t("payment")}
                  </h1>
                </div>

                {/* Step 1: Address */}
                <div
                  className={`transition-all duration-300 ${
                    step === 1 ? "opacity-100 translate-x-0" : "hidden"
                  }`}
                  aria-hidden={step !== 1}
                >
                  <AddressForm
                    countries={countries}
                    detectedCountry={detectedCountry}
                    initialStates={initialStates}
                    defaultValues={addressData ?? undefined}
                    onComplete={handleAddressComplete}
                  />
                </div>

                {/* Step 2: Payment */}
                <div
                  className={`transition-all duration-300 ${
                    step === 2 ? "opacity-100 translate-x-0" : "hidden"
                  }`}
                  aria-hidden={step !== 2}
                >
                  <PaymentDemo
                    data={data as any}
                    totalAmount={totalAmount}
                    onComplete={handlePaymentComplete}
                    onBack={() => setStep(1)}
                  />
                </div>
              </div>
            </div>

            {/* ── Right: Sticky Summary ────────────────────────────────── */}
            <aside
              className="order-1 hidden lg:block lg:order-2"
              aria-label={t("order_summary_sidebar")}
            >
              <div className="sticky top-[120px]">
                <Applyrequest data={initialData as any} showOrderItem={true} />

                {/* <OrderSummary selectedShipping={selectedShipping} /> */}
              </div>
            </aside>
          </div>
        : /* ── Step 3: Success ────────────────────────────────────────── */
          <div className="mx-auto max-w-lg">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <SuccessScreen
                addressData={addressData!}
                orderNumber={orderNumber}
              />
            </div>
          </div>
        }
      </main>

      {/* Skip-to-content for a11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>
    </div>
  );
}
