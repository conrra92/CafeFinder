export const runtime = "nodejs";
import { NextResponse } from "next/server";
const COOKIES = Array.from(
  new Set([process.env.SESSION_COOKIE_NAME ?? "session", "session", "__session"])
);
export async function POST() {
  const res = NextResponse.json({ ok: true });
  COOKIES.forEach((cookieName) => {
    res.cookies.set(cookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
  });
  return res;
}
