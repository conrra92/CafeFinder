import { NextRequest, NextResponse } from "next/server";

const COOKIES = Array.from(
  new Set([process.env.SESSION_COOKIE_NAME ?? "session", "session", "__session"])
);

export function middleware(req: NextRequest){
    const { pathname } = req.nextUrl;
    if(!pathname.startsWith("/dashboard")) return NextResponse.next();

    const has = COOKIES.some((cookieName) => req.cookies.get(cookieName)?.value);
    if(has) return NextResponse.next();

    const url = new URL("/login", req.url);
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/dashboard/:path*"],
}
