import cloudinary from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "Falta el id de la cafetería" },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection("cafeterias").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { ok: false, message: "La cafetería no existe" },
        { status: 404 }
      );
    }

    const data = doc.data() as { publicId?: string } | undefined;

    if (data?.publicId) {
      await cloudinary.uploader.destroy(data.publicId);
    }

    await docRef.delete();

    return NextResponse.json({ ok: true, message: "Cafetería eliminada" });
  } catch (error) {
    console.error("Error eliminando cafetería:", error);

    return NextResponse.json(
      { ok: false, message: "No se pudo eliminar la cafetería" },
      { status: 500 }
    );
  }
}
