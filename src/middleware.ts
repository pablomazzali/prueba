import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes - require authentication
  const protectedPaths = [
    "/dashboard",
    "/subjects",
    "/materials",
    "/ai-tools",
    "/study-plan",
    "/study",
    "/community",
  ];

  const isProtectedPath = protectedPaths.some(
    (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`)
  );

  // If user is not signed in and trying to access protected routes, redirect to login
  if (!session && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If user is signed in and trying to access auth pages, redirect to dashboard
  if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is signed in and on root, redirect to dashboard
  if (session && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is not signed in and on root, redirect to login
  if (!session && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/subjects/:path*",
    "/materials/:path*",
    "/ai-tools/:path*",
    "/study-plan/:path*",
    "/study/:path*",
    "/community/:path*",
  ],
};
