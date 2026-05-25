"use client";

import { useForm } from "react-hook-form";
import { useState, useActionState, startTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import AuthLayout from "../authlayout";
import SocialLogin from "@/components/user/SocialLogin";
import { loginSchema } from "../../utils/login";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import { loginAction } from "@/actions/(user)/login.action";
import { prevData } from "../../utils/prevDataType";

export type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth" as any);
  const local = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [state, formAction, isPending] = useActionState(
    async (prevState: prevData | null, data: LoginFormData) => {
      const res = await loginAction(data, local);
      return res;
    },
    null,
  );

  const onSubmit = async (data: LoginFormData) => {
    try {
      startTransition(() => {
        formAction(data);
      });
      if (!state) return;
      if (state && !state.success) {
        if (state.message === "CredentialsSignin") {
          toast.error(t("login.invalidCredentials"));
        } else if (state.message === "AccessDenied") {
          toast.info(t("login.AccessDenied"));
        } else if (state.message === "TooManyRequest") {
          toast.warning(t("TooManyRequest"));
        } else {
          toast.error(t("login.somethingWentWrong"));
        }
        return;
      }

      if (state?.success) {
        toast.success(t("login.loginSuccessfully"));
        startTransition(() => {
          router.refresh();
          router.push("/");
        });
      }
    } catch (err) {
      toast.error("Network Error");
    }
  };

  return (
    <AuthLayout titleKey="login.title" subtitleKey="login.subtitle">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
        {/* الحقل: البريد الإلكتروني أو اسم المستخدم */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-700 mr-1"
          >
            {t("login.emailOrUsername")}
          </label>
          <div className="relative group">
            {/* أيقونة البريد على اليمين للواجهة العربية */}
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FiMail className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              {...register("email")}
              id="email"
              type="text"
              dir="rtl"
              placeholder={t("login.emailPlaceholder")}
              className="w-full pr-12 pl-4 py-3.5 bg-slate-100/50 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 border transition-all duration-200"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-medium px-1">
              {t("login.emailRequired")}
            </p>
          )}
        </div>

        {/* الحقل: كلمة المرور */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slate-700 mr-1"
          >
            {t("login.password")}
          </label>
          <div className="relative group">
            {/* أيقونة القفل على اليمين */}
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FiLock className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              dir="rtl"
              placeholder={t("login.passwordPlaceholder")}
              className="w-full pr-12 pl-12 py-3.5 bg-slate-100/50 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 border transition-all duration-200"
            />
            {/* زر إظهار/إخفاء كلمة المرور على اليسار */}
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
          {errors.password && (
            <p className="text-xs text-red-500 font-medium px-1">
              {t("login.passwordRequired")}
            </p>
          )}
        </div>

        {/* رابط نسيت كلمة المرور */}
        <div className="flex justify-end">
          <Link
            href="/forget-password"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>

        {/* زر تسجيل الدخول */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 px-6 bg-emerald-600 text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(16,185,129,0.4)] hover:bg-emerald-700 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98] flex items-center justify-center overflow-hidden relative"
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
              <span className="tracking-wide">{t("login.loading")}</span>
            </div>
          : <span className="tracking-wide">{t("login.submit")}</span>}
        </button>

        <SocialLogin />

        {/* رابط إنشاء حساب */}
        <p className="text-center text-sm text-slate-500 pt-2">
          {t("login.noAccount")}{" "}
          <Link
            href="/register"
            className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {t("login.register")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
