import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAdminRoute =
    nextUrl.pathname.startsWith("/admin") ||
    nextUrl.pathname.startsWith("/api/admin");
  const isAccountRoute =
    nextUrl.pathname.startsWith("/account") ||
    nextUrl.pathname.startsWith("/api/account");
  const isCheckoutRoute =
    nextUrl.pathname.startsWith("/checkout") ||
    nextUrl.pathname.startsWith("/api/checkout");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=" + encodeURIComponent(nextUrl.pathname), nextUrl)
      );
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isAccountRoute || isCheckoutRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=" + encodeURIComponent(nextUrl.pathname), nextUrl)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
