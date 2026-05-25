"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { CheckCircle2, Package, Truck, Mail, ArrowRight } from "lucide-react";
import type { AddressData } from "@/app/[locale]/utils/checkout";

type Props = {
  addressData: AddressData;
  orderNumber: string;
};

export default function SuccessScreen({ addressData, orderNumber }: Props) {
  const t = useTranslations("SuccessScreen" as any);
  const hasConfetti = useRef(false);

  useEffect(() => {
    if (hasConfetti.current) return;
    hasConfetti.current = true;

    // Dynamic import for zero bundle impact on earlier steps
    // npm i canvas-confetti
    import("canvas-confetti").then(({ default: confetti }) => {
      // Initial burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#bef264", "#10b981", "#34d399", "#a3e635", "#059669", "#fff"],
        scalar: 1.1,
        gravity: 0.9,
      });

      // Side cannons
      setTimeout(() => {
        confetti({
          particleCount: 600,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#bef264", "#10b981", "#fff"],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#bef264", "#10b981", "#fff"],
        });
      }, 300);

      // Encore
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.4 },
          colors: ["#bef264", "#10b981", "#34d399", "#a3e635"],
          scalar: 0.9,
        });
      }, 700);
    });
  }, []);

  return (
    <div className="flex flex-col items-center text-center space-y-8 py-4">
      {/* ── Animated checkmark ─────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 shadow-2xl shadow-emerald-200">
          <CheckCircle2
            className="h-12 w-12 text-white animate-[pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── Headline ───────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500">
          {t("order_confirmed")}
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("thank_you")},{" "}
          <span className="bg-gradient-to-r from-lime-500 to-emerald-500 bg-clip-text text-transparent">
            {addressData.firstName}!
          </span>
        </h1>
        <p className="text-base text-slate-500">{t("order_placed")}</p>
      </div>

      {/* ── Order info card ─────────────────────────────────────────────── */}
      <div className="w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-lime-50 to-emerald-50 p-5 text-left shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
              {t("order_number")}
            </p>
            <p className="font-mono font-bold text-slate-800">{orderNumber}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
              {t("email")}
            </p>
            <p className="font-medium text-slate-700 truncate">
              {addressData.email}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
              {t("ship_to")}
            </p>
            <p className="font-medium text-slate-700">
              {addressData.firstName} {addressData.lastName}
            </p>
            <p className="text-xs text-slate-500">
              {addressData.city}, {addressData.state}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
              {t("shipping")}
            </p>
            <p className="font-medium capitalize text-slate-700">
              {addressData.shippingMethod}
            </p>
          </div>
        </div>
      </div>

      {/* ── Timeline ───────────────────────────────────────────────────── */}
      <div className="w-full space-y-3">
        {[
          {
            icon: CheckCircle2,
            label: t("timeline.confirmed"),
            sub: t("timeline.just_now"),
            done: true,
          },
          {
            icon: Package,
            label: t("timeline.prepared"),
            sub: t("timeline.estimated_hours", { hours: "1–2" }),
            done: false,
          },
          {
            icon: Truck,
            label: t("timeline.out_for_delivery"),
            sub: t("timeline.estimated_days", { days: "2–5" }),
            done: false,
          },
          {
            icon: Mail,
            label: t("timeline.email_sent"),
            sub: addressData.email,
            done: true,
          },
        ].map(({ icon: Icon, label, sub, done }, i) => (
          <div key={i} className="flex items-center gap-3 text-left">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                done ?
                  "bg-emerald-500 text-white"
                : "border-2 border-slate-200 text-slate-400"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  done ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {label}
              </p>
              <p className="text-xs text-slate-400 truncate">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <a
          href="/"
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 py-3.5 text-sm font-extrabold uppercase tracking-widest text-slate-900 shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] hover:shadow-emerald-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40"
        >
          {t("continue_shopping")}
          <ArrowRight className="h-4 w-4" />
        </a>
        <button
          type="button"
          className="flex-1 cursor-pointer rounded-xl border-2 border-slate-200 py-3.5 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          {t("track_order")}
        </button>
      </div>
    </div>
  );
}
