import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getToken } from "next-auth/jwt";
// import { useLocale } from "next-intl";
import authConfig from "./auth.config";
import NextAuth from "next-auth";
const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const intlResponse = intlMiddleware(req);
  if (path === "/sitemap.xml" || path === "/robots.txt" || path.includes(".")) {
    return NextResponse.next();
  }
  const authen = await auth();

  //  عشان نقدر نتحقق هل المستخدم في صفحه اللوجين ولا لاء
  //  لازم نجيب اللعه الحاليه عشان نضيف في المسار الحالي
  const locale = req.cookies.get("NEXT_LOCALE")?.value;
  // هنا بنضيف اللغه الحاليه في المسار الحالي
  const routerAuth = [`/${locale}/login`, `/${locale}/register`];
  // دي فانكشن بتتحق هل المستخدم مسجل دخول ولا لاء

  const token = authen?.user;
  const isLoggedIn = Boolean(token);
  //
  // );
  //

  if (routerAuth.includes(path) && isLoggedIn) {
    //
    return NextResponse.redirect(new URL("/", nextUrl));
  } else {
    //
  }
  if (intlResponse) return intlResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(ar|de|en|es|fr|hi|ru|zh)/:path*", "/login", "/register"],
};
