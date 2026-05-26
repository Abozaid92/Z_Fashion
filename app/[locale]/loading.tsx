"use client";

export default function Loading() {
  return (
    <div
      className="flex items-center justify-center h-screen flex-col gap-4"
      aria-busy="true"
    >
      {/* Custom Spinner */}
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <div className="absolute inset-0 rounded-full border-2 border-emerald-300 border-b-transparent animate-spin [animation-direction:reverse]" />
      </div>

      {/* Brand */}
      <div className="flex flex-col items-center">
        <p className="text-emerald-600 text-sm font-semibold tracking-wide">
          ZFashion
        </p>

        {/* subtle line animation */}
        <span className="block h-[2px] w-6 bg-emerald-600 mt-1 animate-pulse" />
      </div>
    </div>
  );
}
