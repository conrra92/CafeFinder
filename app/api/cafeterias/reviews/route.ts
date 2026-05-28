import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serverTimestamp } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { cafeId, userId, userEmail, comment, rating } = body as Record<string, any>;

    if (!cafeId || !comment) {
      return NextResponse.json({ ok: false, message: "Faltan datos" }, { status: 400 });
    }

    const ref = await adminDb
      .collection("cafeterias")
      .doc(cafeId)
      .collection("reviews")
      .add({
        userId: userId || "",
        userEmail: userEmail || "Usuario",
        comment: comment || "",
        rating: Number(rating) || 0,
        createdAt: serverTimestamp(),
      });

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (error) {
    console.error("Error guardando reseña:", error);
    return NextResponse.json({ ok: false, message: "No se pudo guardar la reseña" }, { status: 500 });
  }
}
