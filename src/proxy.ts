// src/proxy.ts
import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export async function proxy(request: NextRequest) {
  // 1. Create an unmodified response object to attach cookies to
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Initialize the Supabase client specifically for the proxy
  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Update the request cookies
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );

        // Update the response cookies so the browser saves them
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production", // Only require HTTPS in production
          });
        });
      },
    },
  });

  // 3. Retrieve the current session to ensure the auth token is fresh
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 4. THE SILENT GUEST LOGIN
  // If the user has no session, silently sign them in as an anonymous user.
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error("Silent Auth Failed:", error.message);
      // Note: We don't block the request here. If it fails, they just browse
      // completely unauthenticated, but RAG saves will fail at the RLS level.
    }
  }

  // 5. Return the response with the fresh session cookies attached
  return supabaseResponse;
}

// 6. PERFORMANCE MATCHER
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files, JS chunks)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - .*\\.(?:svg|png|jpg|jpeg|gif|webp)$ (all static media files used by tldraw)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
