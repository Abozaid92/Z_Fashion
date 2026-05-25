interface ShareOptions {
  title: string;
  url: string;
  text?: string; // اختياري
  imageUrl?: string; // اختياري (رابط كلوديناري مثلاً)
}

/**
 * فانكشن شير عالمية تدعم الموبايل والكمبيوتر
 * @returns "shared" للموبايل، "copied" للكمبيوتر، "failed" في حالة الخطأ
 */
export const handleShare = async ({
  title,
  url,
  text,
  imageUrl,
}: ShareOptions): Promise<"shared" | "copied" | "failed"> => {
  // التأكد إن الكود شغال في المتصفح مش السيرفر
  if (typeof window === "undefined") return "failed";

  const fullText = [text, imageUrl ? ` ${imageUrl}` : null]
    .filter(Boolean)
    .join("\n\n");

  const shareData: ShareData = {
    title,
    text: fullText,
    url,
  };

  try {
    // 1. محاولة استخدام الشير الأصلي (موبايل / متصفحات تدعم)
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
      return "shared";
    }

    // 2. لو مفيش دعم للشير (كمبيوتر) -> ننسخ اللينك
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch (error) {
    // لو المستخدم كنسل الشير (AbortError) لا نعتبرها خطأ فادح
    if ((error as Error).name === "AbortError") return "failed";

    console.error("Share utility error:", error);
    return "failed";
  }
};
