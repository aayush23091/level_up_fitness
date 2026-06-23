import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;

  const protectedRoutes = [
    "/app-dashboard",
    "/profile",
    "/profile/password",
  ];

  const publicRoutes = [
    "/login",
    "/signup",
  ];

  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublic = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL("/app-dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/app-dashboard/:path*",
    "/profile/:path*",
  ],
};