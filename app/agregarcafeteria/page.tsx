"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase-client";
import { onAuthStateChanged } from "firebase/auth";
import PublicHeader from "@/components/layout/PublicHeder";

type FeatureKey = "wifi" | "silenciosa" | "enchufes";

const isAdminEmail = (email?: string | null) =>
  email?.toLowerCase() === "admin@admin.com";

const featureOptions: { key: FeatureKey; label: string }[] = [
  { key: "wifi", label: "Wifi de Alta Velocidad" },
  { key: "silenciosa", label: "Zona Silenciosa" },
  { key: "enchufes", label: "Enchufes" },
];

export default function AgregarCafeteria() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [rating, setRating] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureKey[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || !isAdminEmail(currentUser.email)) {
        router.replace("/explorar");
      }
    });

    return () => unsubscribe();
  }, [router]);

  function toggleFeature(feature: FeatureKey) {
    setSelectedFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const ubicacionLimpia = ubicacion.trim();

    if (!ubicacionLimpia) {
      alert("La ubicacion es obligatoria");
      return;
    }

    if (!foto) {
      alert("La foto es obligatoria");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", foto);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.ok) {
        throw new Error(uploadData.message || "No se pudo subir la imagen");
      }

      const response = await fetch("/api/cafeterias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          ubicacion: ubicacionLimpia,
          descripcion,
          foto: uploadData.data.imageUrl,
          publicId: uploadData.data.publicId,
          rating: Number(rating) || 0,
          features: selectedFeatures,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "No se pudo guardar la cafetería");
      }

      alert("Cafetería guardada ☕");

      setNombre("");
      setUbicacion("");
      setDescripcion("");
      setFoto(null);
      setRating("");
      setSelectedFeatures([]);
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
          <h1 className="agregar-titulo">Agregar Cafetería</h1>

          <form onSubmit={handleSubmit} className="agregar-formulario">
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
                  setFoto(e.target.files?.[0] ?? null);
                }}
                required
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

            <div className="campo">
              <label>Calificación</label>

              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label>Características</label>

              <div className="filtros">
                {featureOptions.map((feature) => {
                  const active = selectedFeatures.includes(feature.key);

                  return (
                    <label
                      key={feature.key}
                      className={active ? "filtro filtro--activo" : "filtro"}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleFeature(feature.key)}
                      />
                      <span>{feature.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn-agregar" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cafetería"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
