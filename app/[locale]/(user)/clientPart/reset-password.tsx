"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import AuthLayout from "../authlayout";
import { resetPassword } from "@/actions/(user)/reset-password.action";
import { useActionState, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { prevData } from "../../utils/prevDataType";
import { resetPasswordSchema } from "../../utils/forget_reset_Password";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations("auth" as any);
  const searchParam = useSearchParams();
  const token = searchParam.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: "", colorClass: "", colorText: "" };
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    if (strength <= 2)
      return {
        strength: 33,
        label: t("reset.weak"),
        colorClass: "bg-red-500",
        colorText: "text-red-500",
      };
    if (strength <= 4)
      return {
        strength: 66,
        label: t("reset.medium"),
        colorClass: "bg-yellow-500",
        colorText: "text-yellow-500",
      };
    return {
      strength: 100,
      label: t("reset.strong"),
      colorClass: "bg-emerald-500",
      colorText: "text-emerald-500",
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const [state, formAction, isPending] = useActionState(
    async (prevData: prevData | null, data: ResetPasswordFormData) => {
      const res = await resetPassword(token, data.password);
      return res;
    },
    null,
  );

  const onSubmit = async (data: ResetPasswordFormData) => {
    startTransition(() => {
      formAction(data);
    });
    if (!state) return;
    if (state.success) {
      toast.success(t("reset.successMessage"));
    } else if (!state.success) toast.error(state.message);
  };

  if (state) {
    return (
      <AuthLayout
        titleKey="reset.successTitle"
        subtitleKey="reset.successSubtitle"
      >
        <div className="text-center space-y-6 mt-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="text-5xl text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-700">{t("reset.successMessage")}</p>
            <p className="text-slate-500 text-sm">{t("reset.canLogin")}</p>
          </div>
          <Link
            href="/login"
            className="block w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(16,185,129,0.4)] hover:shadow-none transition-all duration-300 active:scale-[0.98] text-center"
          >
            {t("reset.loginNow")}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout titleKey="reset.title" subtitleKey="reset.subtitle">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-8">
        {/* New Password */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mr-1">
            {t("reset.newPassword")}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FiLock className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              dir="rtl"
              placeholder={t("reset.passwordPlaceholder")}
              className="w-full pr-12 pl-12 py-3.5 bg-slate-100/50 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 border transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
            >
              {showPassword ?
                <FiEyeOff className="w-5 h-5" />
              : <FiEye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength */}
          {password && (
            <div className="flex items-center gap-2 px-1 mt-1">
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${passwordStrength.strength}%` }}
                  className={`h-full ${passwordStrength.colorClass} transition-all duration-300 rounded-full`}
                />
              </div>
              <span
                className={`text-xs font-semibold ${passwordStrength.colorText}`}
              >
                {passwordStrength.label}
              </span>
            </div>
          )}

          {errors.password && (
            <p className="text-xs text-red-500 font-medium px-1">
              {t("reset.passwordInvalid")}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mr-1">
            {t("reset.confirmPassword")}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FiLock className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              dir="rtl"
              placeholder={t("reset.confirmPasswordPlaceholder")}
              className="w-full pr-12 pl-12 py-3.5 bg-slate-100/50 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 border transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
            >
              {showConfirmPassword ?
                <FiEyeOff className="w-5 h-5" />
              : <FiEye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 font-medium px-1">
              {t("reset.passwordMismatch")}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 px-6 bg-emerald-600 text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(16,185,129,0.4)] hover:bg-emerald-700 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98] flex items-center justify-center"
        >
          {isPending ?
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="tracking-wide">{t("reset.loading")}</span>
            </div>
          : <span className="tracking-wide">{t("reset.submit")}</span>}
        </button>

        {/* Back to Login */}
        <p className="text-center text-sm text-slate-500 pt-2">
          <Link
            href="/login"
            className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {t("reset.backToLogin")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
