"use client";
import { Link } from "@/i18n/routing";
export default function NotFound() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 flex items-center justify-center">
      <section
        className="w-full max-w-xl text-center opacity-0 animate-[zf-fade-in_500ms_ease-out_forwards]"
        aria-labelledby="page-not-found-title"
      >
        <div
          className="mx-auto mb-8 flex items-center justify-center gap-3"
          aria-hidden="true"
        >
          <span className="h-px w-10 bg-emerald-200" />
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span className="h-px w-10 bg-emerald-200" />
        </div>

        <p className="text-[88px] sm:text-[112px] md:text-[132px] font-semibold tracking-[0.22em] leading-none text-slate-950 select-none">
          404
        </p>

        <div className="mt-5 space-y-3">
          <h1
            id="page-not-found-title"
            className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900"
          >
            Page not found
          </h1>
          <p className="mx-auto max-w-md text-sm sm:text-base leading-7 text-slate-600">
            The page you’re looking for doesn’t exist.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Go Home
          </Link>
        </div>

        <div
          className="mt-12 flex items-center justify-center gap-3"
          aria-hidden="true"
        >
          <span className="h-3 w-3 border border-emerald-300" />
          <span className="h-px w-16 bg-emerald-100" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="h-px w-16 bg-emerald-100" />
          <span className="h-3 w-3 border border-emerald-300" />
        </div>
      </section>

      <style jsx global>{`
        @keyframes zf-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
