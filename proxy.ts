import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt } from "@/lib/auth";

const publicRoutes = ["/login", "/signup"];

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = request.cookies.get("session")?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  const res = NextResponse.next();
  if (session) {
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    res.cookies.set("session", await encrypt({ ...session, expires }), {
      expires,
      httpOnly: true,
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
