import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");
  // Supabase sometimes returns to Site URL root (?code=...) — forward to auth callback.
  if (code && (url.pathname === "/" || url.pathname === "/login" || url.pathname === "/signup")) {
    url.pathname = "/api/auth/callback";
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip API routes, auth callback, Next internals, static assets.
     * Auth callback runs in the browser (original flow) — middleware must not block it.
     */
    "/((?!_next/|api/|auth/callback|auth/reset-password|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov)$).*)",
  ],
};
