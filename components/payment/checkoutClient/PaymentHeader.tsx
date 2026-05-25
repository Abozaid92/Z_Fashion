import { useTranslations } from "next-intl";
import React from "react";
import CheckoutStepper from "./CheckoutStepper";
import { CheckoutStep } from "@/app/[locale]/utils/checkout";
interface typeProps {
  step: CheckoutStep;
  completedSteps: Set<number>;
}
const PaymentHeader = ({ step, completedSteps }: typeProps) => {
  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4">
          {/* Brand */}
          <div className="mb-4 flex items-center justify-center">
            <a
              href="/"
              aria-label="Go to homepage"
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-lime-400 to-emerald-500 shadow">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="white"
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    strokeWidth="1.5"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Aether<span className="text-emerald-500">Store</span>
              </span>
            </a>
          </div>

          {/* Stepper */}
          <CheckoutStepper currentStep={step} completedSteps={completedSteps} />
        </div>
      </header>
    </div>
  );
};

export default PaymentHeader;
