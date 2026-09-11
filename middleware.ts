import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  // 1. Force HTTPS redirect in production environments if forwarded via http
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host") || "";
  if (proto === "http" && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return NextResponse.redirect(`https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`, 301);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Apply Security Headers (Force HTTPS / HSTS, Frame Guard, Content Type Sniffing)
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      },
    );

    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    const pathname = request.nextUrl.pathname;
    const isPublicPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/privacy") ||
      pathname.startsWith("/terms") ||
      pathname === "/sitemap.xml" ||
      pathname === "/robots.txt" ||
      pathname === "/manifest.webmanifest" ||
      pathname.startsWith("/opengraph-image");
    
    if (!session && !isPublicPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    if (session && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (e) {
    console.warn("Middleware session check error caught:", e);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

