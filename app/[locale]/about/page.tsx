import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import ServerIntl from "@/lib/server-intl";
import { getTranslations } from "next-intl/server"; // ✅ استخدام getTranslations بدلاً من getMessages
import { DOMAIN } from "@/lib/constants";
import redisClient from "@/lib/redisClient";
import { Link } from "@/i18n/routing";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = (await params).locale;
  const t: any = await getTranslations({ locale, namespace: "About.Metadata" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    authors: [{ name: "Ibrahim AbuZaid" }],
    creator: "Ibrahim AbuZaid",
    publisher: "Ibrahim AbuZaid",
    metadataBase: new URL(`${DOMAIN}`),
    alternates: {
      canonical: "/about",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: t("og_title"),
      description: t("og_description"),
      url: `${DOMAIN}`,
      siteName: "ZFashion Store",
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
      images: [
        {
          url: "/og-about.jpg",
          width: 1200,
          height: 630,
          alt: t("og_image_alt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitter_title"),
      description: t("twitter_description"),
      creator: "@zfashionstore",
      images: ["/twitter-about.jpg"],
    },
    category: "Fashion & E-Commerce & clothes & products",
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const mainparam = await params;
  const local = mainparam.locale;

  // ✅ استدعاء دالة الترجمة t للـ Server Component
  const t = await getTranslations({ locale: local, namespace: "About" });
  const namespaces = ["About"];

  // Structured Data for SEO (Translated)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 3,
        name: t("seo.breadcrumb_name"),
        item: "https://zfashion.store/about",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("seo.faq.q1.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("seo.faq.q1.answer"),
        },
      },
      {
        "@type": "Question",
        name: t("seo.faq.q2.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("seo.faq.q2.answer"),
        },
      },
      {
        "@type": "Question",
        name: t("seo.faq.q3.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("seo.faq.q3.answer"),
        },
      },
      {
        "@type": "Question",
        name: t("seo.faq.q4.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("seo.faq.q4.answer"),
        },
      },
      {
        "@type": "Question",
        name: t("seo.faq.q5.question"),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("seo.faq.q5.answer"),
        },
      },
    ],
  };

  try {
    redisClient.incr("stats:about").catch(() => {});
  } catch (e) {
    console.error("Redis error in stats:products :", e);
  }

  return (
    <ServerIntl namespaces={namespaces} params={params}>
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <main
          className={`${playfair.variable} ${dmSans.variable} min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 font-sans`}
          role="main"
        >
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            {/* Breadcrumb Navigation */}
            <nav
              aria-label="Breadcrumb"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"
            >
              <ol
                className="flex items-center space-x-2 text-sm"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
              >
                <li
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <a
                    href="/"
                    className="text-slate-600 hover:text-purple-600 transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">{t("breadcrumb.home")}</span>
                  </a>
                  <meta itemProp="position" content="1" />
                </li>
                <li className="text-slate-400" aria-hidden="true">
                  /
                </li>
                <li
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <span
                    className="text-slate-900 font-medium"
                    itemProp="name"
                    aria-current="page"
                  >
                    {t("breadcrumb.current")}
                  </span>
                  <meta itemProp="position" content="2" />
                </li>
              </ol>
            </nav>

            <div
              className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-blue-100/20"
              aria-hidden="true"
            />
            <div
              className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-purple-200/10 to-transparent blur-3xl"
              aria-hidden="true"
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
              <div className="text-center space-y-6 sm:space-y-8">
                <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
                  <span className="block">{t("hero.title_part_1")}</span>
                  <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {t("hero.title_part_2")}
                  </span>
                </h1>

                <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed">
                  {t("hero.description")}
                </p>

                <div
                  className="flex flex-wrap justify-center gap-3 pt-4"
                  role="list"
                >
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 text-sm font-medium text-slate-700">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("hero.badges.seo")}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 text-sm font-medium text-slate-700">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("hero.badges.support")}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 text-sm font-medium text-slate-700">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("hero.badges.security")}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Our Story Section */}
          <section
            className="py-16 sm:py-24 bg-white"
            itemScope
            itemType="https://schema.org/Organization"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="space-y-6">
                  <h2 className="font-display text-3xl sm:text-5xl font-bold text-slate-900">
                    {t("story.title")}
                  </h2>
                  <p
                    className="text-lg text-slate-600 leading-relaxed"
                    itemProp="description"
                  >
                    {t("story.p1")}
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {t("story.p2")}
                  </p>
                  <meta itemProp="name" content="ZFashion Store" />
                  <meta itemProp="url" content="http://localhost:3000" />
                </div>

                <div className="relative">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 p-8 shadow-xl">
                    <div className="h-full flex flex-col justify-center space-y-6">
                      <div className="space-y-2">
                        <div className="text-5xl font-bold text-slate-900">
                          {t("story.stats.hours.value")}
                        </div>
                        <div className="text-slate-600">
                          {t("story.stats.hours.label")}
                        </div>
                      </div>
                      <div className="h-px bg-slate-300" />
                      <div className="space-y-2">
                        <div className="text-5xl font-bold text-slate-900">
                          {t("story.stats.seo.value")}
                        </div>
                        <div className="text-slate-600">
                          {t("story.stats.seo.label")}
                        </div>
                      </div>
                      <div className="h-px bg-slate-300" />
                      <div className="space-y-2">
                        <div className="text-5xl font-bold text-slate-900">
                          {t("story.stats.support.value")}
                        </div>
                        <div className="text-slate-600">
                          {t("story.stats.support.label")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className="py-16 sm:py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-slate-900">
                  {t("mission_vision.title")}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <article className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 mb-6">
                    <svg
                      className="w-7 h-7 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mb-4">
                    {t("mission_vision.mission.title")}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {t("mission_vision.mission.description")}
                  </p>
                </article>

                <article className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-6">
                    <svg
                      className="w-7 h-7 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mb-4">
                    {t("mission_vision.vision.title")}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {t("mission_vision.vision.description")}
                  </p>
                </article>
              </div>
            </div>
          </section>

          {/* Core Values Section */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 mb-4">
                  {t("values.title")}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {t("values.subtitle")}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                <article className="group relative bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100 hover:border-purple-200 transition-all duration-300">
                  <div
                    className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                      {t("values.perfection.title")}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {t("values.perfection.description")}
                    </p>
                  </div>
                </article>

                <article className="group relative bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all duration-300">
                  <div
                    className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                      {t("values.integrity.title")}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {t("values.integrity.description")}
                    </p>
                  </div>
                </article>

                <article className="group relative bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 border border-indigo-100 hover:border-indigo-200 transition-all duration-300">
                  <div
                    className="absolute top-0 right-0 w-20 h-20 bg-indigo-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                      {t("values.innovation.title")}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {t("values.innovation.description")}
                    </p>
                  </div>
                </article>

                <article className="group relative bg-gradient-to-br from-violet-50 to-white rounded-xl p-6 border border-violet-100 hover:border-violet-200 transition-all duration-300">
                  <div
                    className="absolute top-0 right-0 w-20 h-20 bg-violet-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                      {t("values.trust.title")}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {t("values.trust.description")}
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Support Team Section */}
          <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="space-y-6">
                  <h2 className="font-display text-3xl sm:text-5xl font-bold">
                    {t("support.title")}
                  </h2>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {t("support.p1_part1")}{" "}
                    <strong className="text-white font-semibold">
                      {t("support.p1_strong")}
                    </strong>
                    {t("support.p1_part2")}
                  </p>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {t("support.p2")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-4xl font-bold mb-2">
                      {t("support.stats.monitoring.value")}
                    </div>
                    <div className="text-slate-300 text-sm">
                      {t("support.stats.monitoring.label")}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-4xl font-bold mb-2">
                      {t("support.stats.response.value")}
                    </div>
                    <div className="text-slate-300 text-sm">
                      {t("support.stats.response.label")}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-4xl font-bold mb-2">
                      {t("support.stats.resolution.value")}
                    </div>
                    <div className="text-slate-300 text-sm">
                      {t("support.stats.resolution.label")}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-4xl font-bold mb-2">
                      {t("support.stats.dedication.value")}
                    </div>
                    <div className="text-slate-300 text-sm">
                      {t("support.stats.dedication.label")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why ZFashion Section */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 mb-4">
                  {t("why.title")}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {t("why.subtitle")}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {(() => {
                  const features = [
                    {
                      id: "unrivaled_speed",
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      ),
                    },
                    {
                      id: "modern_saas",
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        />
                      ),
                    },
                    {
                      id: "realtime_connectivity",
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      ),
                    },
                    {
                      id: "smart_notifications",
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      ),
                    },
                    {
                      id: "elite_security",
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      ),
                    },
                    {
                      id: "seamless_experience",
                      icon: (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      ),
                    },
                  ];

                  return features.map((feature) => (
                    <article
                      key={feature.id}
                      className="group bg-slate-50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-slate-200"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          {feature.icon}
                        </svg>
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                        {t(`why.features.${feature.id}.title`)}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {t(`why.features.${feature.id}.description`)}
                      </p>
                    </article>
                  ));
                })()}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 sm:py-24 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-6">
                {t("cta.title")}
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                {t("cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-purple-600 hover:bg-purple-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {t("cta.button")}
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </>
    </ServerIntl>
  );
}
