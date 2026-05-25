"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import AuthLayout from "../authlayout";
import SocialLogin from "@/components/user/SocialLogin";
import { toast } from "react-toastify";
import { registerSchema } from "@/app/[locale]/utils/register";
import { useRouter } from "@/i18n/routing";
import { DOMAIN } from "@/lib/constants";

type RegisterFormData = z.infer<typeof registerSchema>;

const getPasswordMetrics = (password: string) => {
  if (!password || password.trim().length === 0) {
    return { label: "weak", color: "red", width: "0%" };
  }
  if (
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  ) {
    return { label: "strong", color: "#00d577", width: "100%" };
  }
  if (password.length >= 6 && /[a-zA-Z]/.test(password)) {
    return { label: "medium", color: "orange", width: "65%" };
  }
  return { label: "weak", color: "red", width: "30%" };
};

export default function RegisterPage() {
  const t = useTranslations("auth" as any);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");
  const { label, color, width } = getPasswordMetrics(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${DOMAIN}/api/users/register`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const body = await response.json();
      if (!response.ok) {
        if (response.status == 500) {
          toast.error(t("somethingWentWrong"));
        } else {
          toast.error(t(`register.${body.message}`));
        }
        return;
      }
      toast.info(t("login.AccessDenied"));
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout titleKey="register.title" subtitleKey="register.subtitle">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-8">
        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mr-1">
            {t("register.email")}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FiMail className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              {...register("email")}
              type="email"
              dir="rtl"
              placeholder={t("register.emailPlaceholder")}
              className="w-full pr-12 pl-4 py-3.5 bg-slate-100/50 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 border transition-all duration-200"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-medium px-1">
              {t("register.emailInvalid")}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mr-1">
            {t("register.username")}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FiUser className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              {...register("name")}
              type="text"
              dir="rtl"
              placeholder={t("register.usernamePlaceholder")}
              className="w-full pr-12 pl-4 py-3.5 bg-slate-100/50 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 border transition-all duration-200"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 font-medium px-1">
              {t("register.usernameInvalid")}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mr-1">
            {t("register.password")}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FiLock className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              autoComplete="new-password"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              dir="rtl"
              placeholder={t("register.passwordPlaceholder")}
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
          {errors.password && (
            <p className="text-xs text-red-500 font-medium px-1">
              {t("register.passwordInvalid")}
            </p>
          )}
        </div>

        {/* Password Strength Bar */}
        <div className="flex gap-2 items-center px-1">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <span
              style={{ width: width, backgroundColor: color }}
              className="block transition-all duration-500 h-full rounded-full"
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: color }}>
            {t(`register.${label}`)}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-emerald-600 text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(16,185,129,0.4)] hover:bg-emerald-700 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98] flex items-center justify-center"
        >
          {isLoading ?
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
              <span className="tracking-wide">{t("register.loading")}</span>
            </div>
          : <span className="tracking-wide">{t("register.submit")}</span>}
        </button>

        <SocialLogin />

        <p className="text-center text-sm text-slate-500 pt-2">
          {t("register.haveAccount")}{" "}
          <Link
            href="/login"
            className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {t("register.login")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
