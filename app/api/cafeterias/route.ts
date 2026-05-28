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

export async function GET() {
  try {
    const snapshot = await adminDb.collection("cafeterias").get();

    const lista = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as Record<string, any>;

        const reviewsSnapshot = await adminDb
          .collection("cafeterias")
          .doc(doc.id)
          .collection("reviews")
          .get();

        const reviews = reviewsSnapshot.docs.map((r) => r.data());

        return {
          id: doc.id,
          ...data,
          reviews,
        };
      })
    );

    return NextResponse.json({ ok: true, data: lista });
  } catch (error) {
    console.error("Error obteniendo cafeterías:", error);

    return NextResponse.json(
      { ok: false, message: "No se pudieron obtener las cafeterías" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nombre,
      ubicacion,
      descripcion,
      foto,
      publicId,
      rating = 0,
      features = [],
    } = body as Record<string, any>;

    if (!nombre || !ubicacion) {
      return NextResponse.json(
        { ok: false, message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection("cafeterias").add({
      nombre,
      ubicacion,
      descripcion: descripcion || "",
      foto: foto || null,
      publicId: publicId || null,
      rating: Number(rating) || 0,
      features: features || [],
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: docRef.id });
  } catch (error) {
    console.error("Error creando cafetería:", error);

    return NextResponse.json(
      { ok: false, message: "No se pudo crear la cafetería" },
      { status: 500 }
    );
  }
}
