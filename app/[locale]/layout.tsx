import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl"; // ✅ ده الصح في النسخ الحديثة
import { getMessages } from "next-intl/server";
import pickMessages from "@/lib/i18n-utils";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/app/globals.css";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/queryProviders";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Navbar from "@/components/Navbar";
import ContactAdminModal from "./chat/chatModal";
import { auth } from "@/auth";
import { SocketProvider } from "@/context/SocketProvider";
import AnnouncementBar from "@/components/AnnouncementBar";
// ── ✅ التعديل الوحيد: import HydrationBoundary + QueryClient ──
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  fetchNavCategories,
  navCategoryKeys,
} from "@/hooks/use-nav-categories";
import { DOMAIN } from "@/lib/constants";
import redisClient from "@/lib/redisClient";
import Footer from "@/components/homePage/footer";
import { getAnnouncmentNotif } from "./utils/admin/notifications/getAnnouncment-barFromDB";
import getQueryClient from "@/lib/getQueryClient";

// const ContactAdminModal = dynamic(() => import("./chat/chatModal"), {
//   ssr: false, // الشات كدة كدة محتاج متصفح
//   loading: () => <div className="hidden" />, // ميبانش أصلاً وهو بيحمل
// });
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

// Structured Data for SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ZFashion Store",
  url: `${DOMAIN}`,
  description:
    "Premium fashion e-commerce platform offering global trends with cutting-edge technology and unmatched performance.",
  foundingDate: "2026",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+201080761700",
    contactType: "Customer Service",
    availableLanguage: [
      "English",
      "Arabic",
      "Hindi",
      "Spanish",
      "french",
      "chinese",
      "german",
    ],
    areaServed: "Worldwide",
  },
  sameAs: [
    // "https://facebook.com/zfashionstore",
    // "https://twitter.com/zfashionstore",
    "https://www.linkedin.com/in/ibrahim-abuzaid-9750b5404/",
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "EG",
    addressRegion: "Middle East",
  },
};
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${DOMAIN}#website`,
  url: `${DOMAIN}`,
  name: "ZFashion Store",
  potentialAction: {
    "@type": "SearchAction",
    target: `${DOMAIN}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${DOMAIN}#webpage`,
  url: `${DOMAIN}`,
  name: "ZFashion Store",
  isPartOf: {
    "@id": `${DOMAIN}#website`,
  },
  about: {
    "@id": `${DOMAIN}#organization`,
  },
};
export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),

  title: {
    default: "ZFashion Store | Premium Global Fashion",
    template: "%s | ZFashion Store",
  },

  description:
    "Shop premium global fashion with fast delivery, secure checkout, and modern digital experience.",

  keywords: [
    "fashion store",
    "online shopping",
    "clothing",
    "ZFashion",
    "ecommerce fashion",
  ],

  openGraph: {
    type: "website",
    url: DOMAIN,
    siteName: "ZFashion Store",
    title: "ZFashion Store",
    description:
      "Premium global fashion with cutting-edge performance and seamless shopping.",
    images: [
      {
        url: `${DOMAIN}/og.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: DOMAIN,
    languages: {
      en: `${DOMAIN}/en`,
      ar: `${DOMAIN}/ar`,
      fr: `${DOMAIN}/fr`,
      de: `${DOMAIN}/de`,
      zh: `${DOMAIN}/zh`,
      hi: `${DOMAIN}/hi`,
      es: `${DOMAIN}/es`,
      ru: `${DOMAIN}/ru`,
    },
  },

  twitter: {
    card: "summary_large_image",
    title: "ZFashion Store",
    description: "Premium global fashion platform",
    images: [`${DOMAIN}/og.jpg`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ── الحماية الحديدية للـ Hash الـ الأخير ────────────────────────────
if (process.env.NEXT_PHASE !== "phase-production-build") {
  try {
    redisClient
      .hIncrBy("stats:total:allStats", "totalVisits", 1)
      .catch((err) => console.error("Redis Incr Error:", err));
  } catch (e) {
    console.error("Redis incre totalvisits err Error:", e);
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === "ar";

  const session = await auth();

  const userId = session?.user?.id;
  const userDetails = session?.user;
  const userData =
    session?.user ?
      {
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        id: session.user.id || null,
      }
    : null;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: navCategoryKeys.list(),
    queryFn: () =>
      fetchNavCategories(DOMAIN ?? "https://z-fashion-ecru.vercel.app"),
  });
  await queryClient.prefetchQuery({
    queryKey: ["announcement"],
    queryFn: () => getAnnouncmentNotif(),
  });

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body className={`${isRTL ? "font-arabic" : "font-sans"} antialiased `}>
        <NextIntlClientProvider
          locale={locale}
          messages={pickMessages(messages, [
            "Navbar",
            "Footer",
            "nav",
            "Lang",
            "AnnouncementBar",
            "CartNav",
            "Pagination",
            "auth",
            "Notifications",
            "Chat",
            "ChatWidget",
          ])}
        >
          <QueryProvider>
            <SessionProvider>
              <NuqsAdapter>
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={isRTL}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
                <SocketProvider userId={userId}>
                  <HydrationBoundary state={dehydrate(queryClient)}>
                    <AnnouncementBar />
                    <Navbar session={userData} />
                  </HydrationBoundary>
                  {children}
                  <Footer />

                  {session?.user.role !== "ADMIN" && (
                    <ContactAdminModal
                      session={userId}
                      sessionDetails={userDetails}
                    />
                  )}
                </SocketProvider>
                <ReactQueryDevtools
                  initialIsOpen={false}
                  buttonPosition="bottom-left"
                />
              </NuqsAdapter>
            </SessionProvider>
          </QueryProvider>
        </NextIntlClientProvider>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              organizationSchema,
              websiteSchema,
              webPageSchema,
            ]),
          }}
        />
      </body>
    </html>
  );
}
