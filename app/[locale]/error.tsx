"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/routing";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function getErrorKind(error: Error): "network" | "unknown" {
  const message = (error?.message || "").toLowerCase();

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("failed to load") ||
    message.includes("failed to fetch") ||
    message.includes("offline") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("internet")
  ) {
    return "network";
  }

  return "unknown";
}

function getUserMessage(kind: "network" | "unknown") {
  if (kind === "network") {
    return {
      title: "Connection problem",
      message:
        "ZFashion could not load this part right now because the connection seems unstable.",
      hint: "Check your internet connection and try again.",
    };
  }

  return {
    title: "Something went wrong",
    message: "ZFashion hit an unexpected issue while loading this page.",
    hint: "Try again in a moment.",
  };
}

export default function Error({ error, reset }: ErrorProps) {
  const kind = getErrorKind(error);
  const copy = getUserMessage(kind);

  useEffect(() => {
    console.error("ZFashion page error:", {
      name: error?.name,
      message: error?.message,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <section
      className="min-h-screen w-full bg-white px-6 py-16 flex items-center justify-center"
      aria-live="polite"
    >
      <div className="w-full max-w-xl text-center">
        <div
          className="mx-auto mb-8 h-px w-24 bg-emerald-200"
          aria-hidden="true"
        />

        <header className="space-y-4">
          <p className="text-sm font-medium tracking-[0.3em] text-emerald-600 uppercase">
            ZFashion
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            {copy.title}
          </h1>
          <p className="mx-auto max-w-md text-sm sm:text-base leading-6 text-slate-600">
            {copy.message}
          </p>
          <p className="text-sm text-slate-500">{copy.hint}</p>
        </header>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </section>
  );
}
