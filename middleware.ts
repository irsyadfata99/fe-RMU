// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value || getTokenFromLocalStorage(request);
  const { pathname } = request.nextUrl;

  // Only check untuk /dashboard routes
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect dari /login ke /dashboard jika sudah ada token
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Helper to get token from localStorage (for client-side navigation)
function getTokenFromLocalStorage(request: NextRequest): string | null {
  // Note: localStorage tidak bisa diakses di middleware
  // Kita hanya rely on cookie untuk server-side checks
  // Client-side akan di-handle oleh useAuth hook
  return null;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
