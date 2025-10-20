import { NextRequest, NextResponse } from "next/server";

const GUEST_PATHS = ["/", "/login", "/signup", "/forgot-password"];

export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl.clone();
    const path = url.pathname;

    const hasCookie = req.cookies.get("omniblox_logged_in")?.value === "1";

    if (hasCookie) {
      // If user appears logged in and is trying to access guest route, redirect to dashboard
      for (const guest of GUEST_PATHS) {
        if (path === guest || path.startsWith(guest + "/")) {
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }
    }

    return NextResponse.next();
  } catch (err) {
    // On error, don't block the request
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/((?!api|_next|static).*)",
  ],
};
