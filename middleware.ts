import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;

  // www redirect for ALL paths (including /auth/callback — was excluded before and broke PKCE).
  if (hostname === 'theoraclepic4.com') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.hostname = 'www.theoraclepic4.com';
    return NextResponse.redirect(redirectUrl, 308);
  }

  const pathname = request.nextUrl.pathname;

  // OAuth return with ?code= on home/login/signup
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");
  if (code && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // Skip session refresh on auth callback and API routes
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov)$).*)",
  ],
};
