// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasViewByPath } from "@/lib/perm";

// blok halaman auth kalau sudah login
const AUTH_ROUTES = ["/auth/signin", "/auth/register", "/auth/forgot-password"];
const AFTER_LOGIN_REDIRECT = "/dashboard";

// HANYA guard VIEW (RBAC) — minimal: /dashboard/users ⇒ employees:view
const PAGE_VIEW_RULES: { re: RegExp; module: string }[] = [{ re: /^\/dashboard\/users$/, module: "employees" }];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname, searchParams } = req.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));
  const isProtected = pathname.startsWith("/dashboard");

  // sudah login → blokir halaman auth
  if (isLoggedIn && isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = AFTER_LOGIN_REDIRECT;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // belum login → redirect ke signin
  if (!isLoggedIn && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(url);
  }

  // RBAC: cek VIEW berdasarkan slug dari query (?slug=...)
  if (isLoggedIn && isProtected) {
    for (const rule of PAGE_VIEW_RULES) {
      if (!rule.re.test(pathname)) continue;

      const userId = (req.auth?.user?.userId as string) || "";

      console.log(pathname, rule.module, userId);

      const ok = !!userId && hasViewByPath(userId, pathname, rule.module);
      if (!ok) {
        const url = req.nextUrl.clone();
        url.pathname = "/403";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*"],
};
