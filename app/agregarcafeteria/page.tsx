"use client";

import { useState } from "react";

import { db, storage } from "@/lib/firebase/client";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import PublicHeader from "@/components/layout/PublicHeder";

export default function AgregarCafeteria() {

  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    try {

      setLoading(true);

      let imageUrl = "";

      // SUBIR IMAGEN
      if (foto) {

        const imageRef = ref(
          storage,
          `cafeterias/${Date.now()}-${foto.name}`
        );

        await uploadBytes(imageRef, foto);

        imageUrl = await getDownloadURL(imageRef);
      }

      // GUARDAR EN FIRESTORE
      await addDoc(collection(db, "cafeterias"), {

        nombre,
        ubicacion,
        descripcion,
        foto: imageUrl,

        createdAt: serverTimestamp(),

      });

      alert("Cafetería guardada ☕");

      setNombre("");
      setUbicacion("");
      setDescripcion("");
      setFoto(null);

    } catch (error) {

      console.error(error);

      alert("Error al guardar");

    } finally {

      setLoading(false);
    }
  }

  return (
    <div>
        <PublicHeader />

        <div className="agregar-page">

        <div className="agregar-card">

            <h1 className="agregar-titulo">
            Agregar Cafetería ☕
            </h1>

            <form
            onSubmit={handleSubmit}
            className="agregar-formulario"
            >

            <div className="campo">

                <label>Nombre</label>

                <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                />

            </div>

            <div className="campo">

                <label>Foto</label>

                <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                    setFoto(e.target.files[0]);
                    }
                }}
                />

            </div>

            <div className="campo">

                <label>Ubicación</label>

                <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                required
                />

            </div>

            <div className="campo">

                <label>Descripción</label>

                <textarea
                rows={5}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                />

            </div>

            <button
                type="submit"
                className="btn-agregar"
            >
                {loading
                ? "Guardando..."
                : "Guardar Cafetería"}
            </button>

            </form>

        </div>

        </div>
    </div>
  );
}