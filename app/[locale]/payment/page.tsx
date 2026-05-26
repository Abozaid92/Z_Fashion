import { headers } from "next/headers";
import type { Metadata } from "next";
import CheckoutClient from "@/components/payment/checkoutClient/CheckoutClient";
import ServerIntl from "@/lib/server-intl";
import { getStatesByCountry } from "../utils/paymentAction";
import type { Country } from "@/app/[locale]/utils/checkout";

// ── SEO ──────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Checkout — ZFashion",
  description:
    "Complete your order securely. Fast, safe checkout powered by SSL encryption.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Checkout — ZFashion",
    description: "Secure checkout. Multiple payment options.",
    type: "website",
  },
};

// ── Fetch countries from REST Countries API (server-only) ────────────────────
// ── Fetch countries from REST Countries API (server-only) ────────────────────
async function fetchCountries(): Promise<Country[]> {
  const fallbackCountries = [
    { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44" },
    { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
    { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
    { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49" },
    { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
    { code: "EG", name: "Egypt", flag: "🇪🇬", dialCode: "+20" },
    { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971" },
    { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966" },
    { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81" },
    { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
    { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "+55" },
    { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65" },
    { code: "NL", name: "Netherlands", flag: "🇳🇱", dialCode: "+31" },
  ];

  // 🚀 حماية الـ Build القصوى: لو السيرفر بيعمل Build، ارجع الـ Fallback فوراً في ملي ثانية ومتحاولش تكلم الـ API
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return fallbackCountries;
  }

  try {
    // تم تصحيح الـ URL وحذف سهم السنجل كوت (') الزيادة اللي كان بعد كلمة all
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,flag,idd",
      { next: { revalidate: 86400 } }, // Cache 24 h
    );

    if (!res.ok) throw new Error("Countries API error");

    const raw = await res.json();

    return (
      raw
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => {
          const root: string = c.idd?.root ?? "";
          const suffix: string =
            c.idd?.suffixes?.length === 1 ? c.idd.suffixes[0] : "";
          return {
            code: c.cca2 as string,
            name: c.name?.common as string,
            flag: c.flag as string,
            dialCode: `${root}${suffix}`,
          } satisfies Country;
        })
        .filter((c: Country) => c.code && c.name)
        .sort((a: Country, b: Country) => a.name.localeCompare(b.name))
    );
  } catch {
    // الـ Fallback الطبيعي لو الـ API وقع والموقع شغال لايف
    return fallbackCountries;
  }
}

// ── Detect user country from Vercel / Cloudflare geo headers ────────────────
async function detectCountry(): Promise<string> {
  const reqHeaders = await headers();

  // Vercel Edge Runtime injects this automatically
  const vercelCountry = reqHeaders.get("x-vercel-ip-country");
  if (vercelCountry) return vercelCountry.toUpperCase();

  // Cloudflare CDN header
  const cfCountry = reqHeaders.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX") return cfCountry.toUpperCase();

  // Fallback: accept-language heuristic
  const lang = reqHeaders.get("accept-language") ?? "";
  if (lang.startsWith("ar")) return "EG";
  if (lang.startsWith("de")) return "DE";
  if (lang.startsWith("fr")) return "FR";
  if (lang.startsWith("ja")) return "JP";

  return "US"; // Ultimate fallback
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Both run in parallel on the server — zero client-bundle cost
  const [countries, detectedCountry] = await Promise.all([
    fetchCountries(),
    detectCountry(),
  ]);

  // Pre-fetch initial states for the detected country
  const initialStates = await getStatesByCountry(detectedCountry);

  return (
    <ServerIntl
      namespaces={[
        "Checkout",
        "AddressForm",
        "PaymentDemo",
        "OrderSummary",
        "SuccessScreen",
        "PaymentHeader",
        "Applyrequest",
      ]}
      params={params}
    >
      <CheckoutClient
        countries={countries}
        detectedCountry={detectedCountry}
        initialStates={initialStates}
      />
    </ServerIntl>
  );
}
