"use client";

import { useTranslations } from "next-intl";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

type Provider = "github" | "google";

const socialProviders = [
  {
    name: "google",
    icon: FcGoogle,
    label: "Google",
    bgColor: "bg-white hover:bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border border-gray-200",
    shadow: "hover:shadow-gray-100",
  },

  {
    name: "github",
    icon: FaGithub,
    label: "GitHub",
    bgColor: "bg-[#24292e] hover:bg-[#1a1e22]",
    textColor: "text-white",
    borderColor: "border border-[#24292e]",
    shadow: "hover:shadow-gray-300",
    iconColor: "text-white",
  },
];

export default function SocialLogin() {
  const t = useTranslations("auth" as any);

  const socialLoginHandler = (provider: Provider) => {
    signIn(provider, { redirectTo: "/" });
  };

  return (
    <div className="w-full space-y-4">
      {/* Divider */}
      <div className="relative my-6 flex items-center">
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-4 shrink-0 text-xs font-medium uppercase tracking-widest text-gray-400">
          {t("social.divider")}
        </span>
        <div className="flex-grow border-t border-gray-200" />
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {socialProviders.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={() =>
              provider.name === "github" ? socialLoginHandler("github")
              : provider.name === "google" ? socialLoginHandler("google")
              : undefined
            }
            className={`
              group relative flex cursor-pointer items-center justify-center gap-2.5
              rounded-xl px-4 py-3 text-sm font-semibold
              transition-all duration-200 ease-out
              ${provider.bgColor}
              ${provider.textColor}
              ${provider.borderColor}
              shadow-sm hover:shadow-md ${provider.shadow}
              active:scale-[0.97]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400
            `}
          >
            <provider.icon className="text-[1.2rem] shrink-0" />
            <span className="hidden sm:inline">{provider.label}</span>
            <span className="sm:hidden">{provider.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
