export const runtime = "nodejs";
import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

const COOKIES = Array.from(
  new Set([process.env.SESSION_COOKIE_NAME ?? "session", "session", "__session"])
);
export async function getServerUser() {
  const cookieStore = await cookies();
  const token = COOKIES.map((cookieName) => cookieStore.get(cookieName)?.value).find(Boolean);
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    return decoded as {
      uid: string;
      email?: string;
      name?: string;
      picture?: string;
    };
  } catch {
    return null;
  }
}
