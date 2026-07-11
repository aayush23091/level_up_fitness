import { NextRequest, NextResponse } from "next/server";
import { getDashboardPath, getRoleFromToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;

  const protectedRoutes = [
    "/app-dashboard",
    "/admin-dashboard",
    "/coach-dashboard",
    "/profile",
    "/profile/password",
  ];

  const publicRoutes = ["/login", "/signup", "/admin/login", "/forgot-password", "/reset-password"];

  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin-dashboard") && token) {
    const role = getRoleFromToken(token);
    if (role !== "admin") {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
    }
  }

  if (pathname.startsWith("/coach-dashboard") && token) {
    const role = getRoleFromToken(token);
    if (role !== "coach") {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
    }
  }

  if (isPublic && token) {
    const role = getRoleFromToken(token);
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/admin/login",
    "/forgot-password",
    "/reset-password/:path*",
    "/app-dashboard/:path*",
    "/admin-dashboard/:path*",
    "/coach-dashboard/:path*",
    "/profile/:path*",
  ],
};
