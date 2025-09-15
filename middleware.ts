// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasViewByPath } from "@/lib/perm";

// blok halaman auth kalau sudah login
const AUTH_ROUTES = ["/auth/signin", "/auth/register", "/auth/forgot-password"];
const AFTER_LOGIN_REDIRECT = "/dashboard";

// Aturan VIEW (RBAC)
// - Gunakan `module` (string) untuk satu modul (compat lama)
// - Atau `modules` (string[]) untuk beberapa modul
// - `mode`: 'any' (default) = minimal 1 modul boleh, 'all' = semua modul wajib boleh
type ViewRule = {
  re: RegExp;
  module?: string; // legacy: satu modul
  modules?: string[]; // baru: banyak modul
  mode?: "any" | "all"; // default 'any'
};

// Contoh:
// - /dashboard/users: cukup punya 'employees' (any, default)
// - /dashboard/settings: wajib punya 'settings' DAN 'employees' (all)
const PAGE_VIEW_RULES: ViewRule[] = [
  { re: /^\/dashboard\/users$/, module: "employees" },
  { re: /^\/dashboard\/roles-permissions$/, module: "roles" },
  // { re: /^\/dashboard\/settings$/, modules: ["settings", "employees"], mode: "all" },
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

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

      // Jika tidak ada modul terdefinisi, treat as allowed (tidak memblok)
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
  matcher: ["/auth/:path*", "/dashboard/:path*"],
};
