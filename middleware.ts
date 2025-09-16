// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasViewByPath } from "./lib/perm/core";

const AUTH_ROUTES = ["/auth/signin", "/auth/register", "/auth/forgot-password"];
const AFTER_LOGIN_REDIRECT = "/dashboard";

type ViewRule = {
  re: RegExp;
  module?: string;
  modules?: string[];
  mode?: "any" | "all";
};

const PAGE_VIEW_RULES: ViewRule[] = [
  { re: /^\/dashboard\/users$/, module: "employees" },
  { re: /^\/dashboard\/roles-permissions$/, module: "roles" },
  // { re: /^\/dashboard\/settings$/, modules: ["settings", "employees"], mode: "all" },
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // ⬇️ Root: redirect ke auth kalau belum login, ke dashboard kalau sudah login
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = isLoggedIn ? AFTER_LOGIN_REDIRECT : "/auth/signin";
    url.search = "";
    return NextResponse.redirect(url);
  }

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

  // RBAC: cek VIEW
  if (isLoggedIn && isProtected) {
    for (const rule of PAGE_VIEW_RULES) {
      if (!rule.re.test(pathname)) continue;

      const userId = (req.auth?.user?.userId as string) || "";
      const mode = rule.mode ?? "any";
      const modules = rule.modules ?? (rule.module ? [rule.module] : []);

      if (modules.length === 0) continue;

      const can = (m: string) => !!userId && hasViewByPath(userId, pathname, m);
      const ok = mode === "all" ? modules.every(can) : modules.some(can);

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
  // ⬇️ Sertakan "/" agar middleware jalan di root
  matcher: ["/", "/auth/:path*", "/dashboard/:path*"],
};
