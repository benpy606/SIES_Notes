import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            request.cookies.set(cookie.name, cookie.value)
          }
          supabaseResponse = NextResponse.next({
            request,
          })
          for (const cookie of cookiesToSet) {
            supabaseResponse.cookies.set(cookie.name, cookie.value, cookie.options)
          }
        },
      },
    },
  );

  return supabaseResponse
};
