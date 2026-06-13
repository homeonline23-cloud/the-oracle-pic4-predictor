import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");
  // Supabase sometimes returns to Site URL root (?code=...) — forward to auth callback.
  if (code && (url.pathname === "/" || url.pathname === "/login" || url.pathname === "/signup")) {
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip API routes, Next internals, static assets — avoids HTML redirects/timeouts on /api/*.
     */
    "/((?!_next/|api/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov)$).*)",
  ],
};
