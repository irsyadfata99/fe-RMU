// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware untuk protected routes
 * - Redirect ke /login jika belum login
 * - Redirect ke /dashboard jika sudah login (dari /login)
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes yang tidak perlu auth
  const publicRoutes = ["/", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Dashboard routes (protected)
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      console.log("[Middleware] Redirecting to /login - No token");
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname); // Save redirect path
      return NextResponse.redirect(loginUrl);
    }
    // User has token, allow access
    return NextResponse.next();
  }

  // Login page - redirect to dashboard if already logged in
  if (pathname === "/login") {
    if (token) {
      console.log("[Middleware] Redirecting to /dashboard - Already logged in");

      // Check if there's a redirect parameter
      const redirectPath = request.nextUrl.searchParams.get("redirect");
      const dashboardUrl = new URL(redirectPath || "/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // User not logged in, show login page
    return NextResponse.next();
  }

  // Logout page - always allow
  if (pathname === "/logout") {
    return NextResponse.next();
  }

  // Public routes - always allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Default: allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - mockServiceWorker.js (MSW worker)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|mockServiceWorker.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
