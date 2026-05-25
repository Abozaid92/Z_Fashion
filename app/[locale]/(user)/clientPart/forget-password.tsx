"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiMail, FiCheckCircle } from "react-icons/fi";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import AuthLayout from "../authlayout";
import { forgetPassword } from "@/actions/(user)/forget-password.action";
import { toast } from "react-toastify";
import { useActionState, startTransition } from "react";
import { emailschema } from "../../utils/forget_reset_Password";
import { prevData } from "../../utils/prevDataType";

type ForgotPasswordFormData = z.infer<typeof emailschema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth" as any);
  const locale = useLocale();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(emailschema),
  });

  const [state, formAction, isPending] = useActionState(
    async (prevState: prevData | null, data: ForgotPasswordFormData) => {
      const res = await forgetPassword(data.email, locale);
      return res;
    },
    null,
  );

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      startTransition(() => {
        formAction(data);
      });
      if (!state) return;
      if (!state?.success) {
        toast.error(t("forgot.userNotFound"));
      } else if (state.success) {
        toast.info(t("forgot.successMessage"));
      }
    } catch (error) {
      toast.error("someThing went Wrong");
    }
  };

  if (state?.success) {
    return (
      <AuthLayout
        titleKey="forgot.successTitle"
        subtitleKey="forgot.successSubtitle"
      >
        <div className="text-center space-y-6 mt-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="text-5xl text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-700">{t("forgot.successMessage")}</p>
            <p className="text-slate-500 text-sm">{t("forgot.checkEmail")}</p>
          </div>
          <Link
            href="/login"
            className="block w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(16,185,129,0.4)] hover:shadow-none transition-all duration-300 active:scale-[0.98] text-center"
          >
            {t("forgot.backToLogin")}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout titleKey="forgot.title" subtitleKey="forgot.subtitle">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
        {/* Info Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-slate-600 text-sm">{t("forgot.info")}</p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mr-1">
            {t("forgot.email")}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FiMail className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              {...register("email")}
              type="email"
              dir="rtl"
              placeholder={t("forgot.emailPlaceholder")}
              className="w-full pr-12 pl-4 py-3.5 bg-slate-100/50 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 border transition-all duration-200"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-medium px-1">
              {t("forgot.emailInvalid")}
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
              <span className="tracking-wide">{t("forgot.loading")}</span>
            </div>
          : <span className="tracking-wide">{t("forgot.submit")}</span>}
        </button>

        {/* Back to Login */}
        <p className="text-center text-sm text-slate-500 pt-2">
          <Link
            href="/login"
            className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {t("forgot.backToLogin")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
