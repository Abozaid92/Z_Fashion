"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { verifyToken } from "@/actions/(user)/verify..action";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function VerifyPage() {
  const t = useTranslations("auth" as any);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        toast.error("Invalid verification link");
        return;
      }
      try {
        const response = await verifyToken(token);
        if (response?.success) {
          setMessage("Your email has been verified successfully!");
          setStatus("success");
        } else if (!response?.success) {
          setStatus("error");
          toast.error(response?.message);
          setMessage(response?.message);
        }
      } catch (error) {
        setStatus("error");
        setMessage(t("verify.something Went Wrong"));
      }
    };
    verifyEmail();
  }, [token]);

  const handleRefresh = async () => {
    useRouter().refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 p-8 text-center">
            {status === "loading" && (
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            )}
            {status === "error" && (
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <h1
              className={`text-2xl font-bold mb-3 ${
                status === "success" ? "text-emerald-700"
                : status === "error" ? "text-red-600"
                : "text-slate-700"
              }`}
            >
              {status === "loading" && t("verify.loading")}
              {status === "success" && t("verify.success")}
              {status === "error" && t("verify.error")}
            </h1>

            <p className="text-slate-600 text-base mb-8">{message}</p>

            {status === "success" && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-right">
                  <p className="text-emerald-700 text-sm">
                    {t("verify.successNote")}
                  </p>
                </div>
                <Link
                  href="/login"
                  className="block w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(16,185,129,0.4)] hover:shadow-none transition-all duration-300 active:scale-[0.98]"
                >
                  {t("verify.goToLogin")}
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-right">
                  <p className="text-red-700 text-sm">
                    {t("verify.errorNote")}
                  </p>
                </div>
                <Link
                  onClick={handleRefresh}
                  href="/login"
                  className="block w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(16,185,129,0.4)] hover:shadow-none transition-all duration-300 active:scale-[0.98]"
                >
                  {t("verify.goToLogin")}
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-5 text-center border-t border-slate-100">
            <p className="text-slate-500 text-sm">{t("verify.needHelp")} </p>
          </div>
        </div>
      </div>
    </div>
  );
}
