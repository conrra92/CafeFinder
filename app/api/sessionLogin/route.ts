import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req: Request) {
  try {
    
    const { idToken, remember } = await req.json();

    const expiresIn = remember
      ? 60 * 60 * 24 * 5 * 1000
      : 60 * 60 * 1000;

    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: "ok" });

    const cookieName = process.env.SESSION_COOKIE_NAME || "session";

    response.cookies.set(cookieName, sessionCookie, {
      httpOnly: true,
      secure: false,
      maxAge: expiresIn / 1000,
      path: "/",
    });

    return response;

  } catch (error: any) {
      console.error("🔥 ERROR REAL:", error); // 👈 AGREGA ESTO

      return NextResponse.json(
        { error: error.message || "Cannot create session" },
        { status: 401 }
      );
    }
}