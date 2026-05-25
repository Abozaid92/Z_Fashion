import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

if (process.env.NODE_ENV === "production") {
  const originalError = console.error;
  console.error = (...args) => {
    // هنا بنحول أول عنصر لنص سواء كان String أو Error Object عشان نضمن إنه يلقط الكلمة
    const errorString =
      args[0] instanceof Error ? args[0].message : String(args[0]);

    if (errorString.includes("MISSING_MESSAGE")) {
      return; // كتم الخطأ تماماً
    }
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

    // بنسيبها فاضية عشان نكتم أي شكوى داخلية من المكتبة
    onError(error) {
      if (error.code === "MISSING_MESSAGE") return;
    },

    // التعديل الصح هنا: getMessageFallback وليس onMessageFallback
    getMessageFallback({ key, namespace }) {
      return namespace ? `${namespace}.${key}` : key;
    },
  };
});
