import React from "react";
import { getMessages } from "next-intl/server";
import { pickMessages } from "./i18n-utils";
import { NextIntlClientProvider } from "next-intl";

type Props = {
  namespaces: string[];
  // التعديل الأول: تعريف النوع كـ Promise عشان يوافق Next 15 ✅
  params: Promise<{ locale: string }> | { locale: string };
  children: React.ReactNode;
};

export default async function ServerIntl({
  namespaces,
  params,
  children,
}: Props) {
  // التعديل الثاني: فتح الصندوق (await) قبل الاستخدام ✅
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Fetch messages using the resolved locale
  const messages = await getMessages({ locale });
  const pageMessages = pickMessages(messages, namespaces || []);

  return (
    <NextIntlClientProvider locale={locale} messages={pageMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
