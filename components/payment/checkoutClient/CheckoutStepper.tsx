"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { CheckoutStep } from "@/app/[locale]/utils/checkout";

type Props = {
  currentStep: CheckoutStep;
  completedSteps: Set<number>;
};

export default function CheckoutStepper({
  currentStep,
  completedSteps,
}: Props) {
  const t = useTranslations("Checkout" as any);

  const STEPS = [
    { number: 1, label: t("steps.information") },
    { number: 2, label: t("steps.payment") },
    { number: 3, label: t("steps.confirmation") },
  ] as const;
  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const isDone = completedSteps.has(step.number);
          const isActive = currentStep === step.number;
          const isUpcoming = !isDone && !isActive;

          return (
            <li key={step.number} className="flex items-center">
              {/* Circle */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={[
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500",
                    isDone ?
                      "step-done border-emerald-500 bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.45)]"
                    : isActive ?
                      "border-lime-400 bg-slate-900 text-lime-300 shadow-[0_0_20px_rgba(190,242,100,0.35)] ring-4 ring-lime-400/20"
                    : "border-slate-300 bg-white text-slate-400",
                  ].join(" ")}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isDone ?
                    <Check
                      className="h-5 w-5 animate-[pop_0.3s_ease-out]"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  : <span>{step.number}</span>}

                  {/* Active pulse ring */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-lime-400/20 pointer-events-none" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={[
                    "hidden sm:block text-xs font-medium tracking-wide uppercase transition-colors duration-300",
                    isDone ? "text-emerald-600"
                    : isActive ? "text-slate-800"
                    : "text-slate-400",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="relative mx-3 h-[2px] w-16 sm:w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-700 ease-out"
                    style={{ width: isDone ? "100%" : "0%" }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
