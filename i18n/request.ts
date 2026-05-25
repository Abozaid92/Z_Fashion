import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

if (process.env.NODE_ENV === "production") {
  const originalError = console.error;
  console.error = (...args) => {
    // إذا كان الخطأ يحتوي على كلمة MISSING_MESSAGE، تجاهله تماماً
    if (typeof args[0] === "string" && args[0].includes("MISSING_MESSAGE")) {
      return;
    }
    // غير ذلك، اطبع الخطأ بشكل طبيعي
    originalError(...args);
  };
}
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,

    // 1. دي اللي بتسكت الإيرورز الحمراء في الكونسول
    onError(error) {
      // بنسيبها فاضية عشان نكتم أي شكوى من المكتبة
    },

    // 2. دي اللي بتخلي الموقع ميبوظش لو الترجمة ناقصة
    // بتعرض الـ key نفسه (مثلاً: "Buttons.save") بدل ما تطلع إيرور
    onMessageFallback({ key, namespace }: any) {
      return key;
    },
  };
});
