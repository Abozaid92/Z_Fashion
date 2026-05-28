import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin();

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const cspHeader = `
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com https://www.gstatic.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' blob: data: https://res.cloudinary.com avatars.githubusercontent.com lh3.googleusercontent.com images.unsplash.com via.placeholder.com placehold.co picsum.photos source.unsplash.com https://www.paypalobjects.com;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://api.cloudinary.com https://www.paypal.com https://www.sandbox.paypal.com https://real-time-chat-for-zfashion-chat.up.railway.app wss://real-time-chat-for-zfashion-chat.up.railway.app;
frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com;
frame-ancestors 'self' https://search.google.com;
`;

const nextConfig: NextConfig = {
  // إخفاء الـ Header اللي بيقول إننا شغالين Next.js (إخفاء الهوية)
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "source.unsplash.com" },
    ],
  },

  // 2. تطبيق كل الـ Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader
              .replace(/\n/g, "")
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // تم تحويلها لـ SAMEORIGIN لأن الـ CSP الحديث يعتمد على frame-ancestors وللسماح بالـ Framing الداخلي الآمن
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withAnalyzer(withNextIntl(nextConfig));
