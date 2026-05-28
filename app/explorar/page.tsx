"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { auth } from "@/lib/firebase-client";
import PublicHeader from "@/components/layout/PublicHeder";
import { onAuthStateChanged } from "firebase/auth";
// no client Firestore imports — the server API returns cafeterías
import { getDisplayRating } from "@/lib/cafeteria-rating";

interface Cafeteria {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  foto?: string;
  publicId?: string;
  rating?: number;
  displayRating?: number;
}

const isAdminEmail = (email?: string | null) =>
  email?.toLowerCase() === "admin@admin.com";

function ExplorarContent() {
  const searchParams = useSearchParams();

  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const isDeleteMode = searchParams.get("mode") === "delete";
  const canDelete = isDeleteMode && isAdmin;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsAdmin(isAdminEmail(currentUser?.email));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function obtenerCafeterias() {
      try {
        const res = await fetch("/api/cafeterias");
        const json = await res.json();

        const lista = (json.data || []).map((item: any) => {
          const data = item as any;

          const reviews = (data.reviews || []).map((r: any) => ({ rating: Number(r.rating) || 0 }));

          return {
            id: data.id,
            nombre: data.nombre,
            ubicacion: data.ubicacion,
            descripcion: data.descripcion,
            foto: data.foto,
            publicId: data.publicId,
            rating: data.rating,
            displayRating: getDisplayRating(data.rating ?? 0, reviews),
          } as Cafeteria;
        });

        setCafeterias(lista);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    obtenerCafeterias();
  }, []);

  async function handleDelete(cafe: Cafeteria) {
    try {
      setDeletingIds((prev) => [...prev, cafe.id]);

      const response = await fetch(`/api/cafeterias?id=${encodeURIComponent(cafe.id)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar la cafetería");
      }

      setCafeterias((prev) => prev.filter((item) => item.id !== cafe.id));
      alert("Cafetería eliminada");
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la cafetería");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== cafe.id));
    }
  }

  return (
    <div>
      <PublicHeader />
      <div className="explorar-page">
        <div className="explorar-container">
          <h1 className="explorar-titulo">Explorar Cafeterías ☕</h1>

          <p className="explorar-subtitulo">
            Descubre cafeterías agregadas por la comunidad
          </p>

          {canDelete && <p className="loading">Modo eliminación activado</p>}

          {loading ? (
            <p className="loading">Cargando cafeterías...</p>
          ) : cafeterias.length === 0 ? (
            <p className="loading">No hay cafeterías registradas</p>
          ) : (
            <div className="cafeterias-grid">
              {cafeterias.map((cafe) => (
                <div key={cafe.id} className="cafeteria-card">
                  <Link href={`/cafeterias/${cafe.id}`} className="cafeteria-card__link">
                    {cafe.foto ? (
                      <img
                        src={cafe.foto}
                        alt={cafe.nombre}
                        className="cafeteria-img"
                      />
                    ) : (
                      <div className="cafeteria-img-placeholder">Sin imagen ☕</div>
                    )}

                    <div className="cafeteria-content">
                      <h2>{cafe.nombre}</h2>

                      <p className="ubicacion">📍 {cafe.ubicacion}</p>

                      <p className="descripcion">
                        ⭐ {(cafe.displayRating ?? cafe.rating ?? 0).toFixed(1)} / 5
                      </p>

                      <p className="descripcion">{cafe.descripcion}</p>
                    </div>
                  </Link>

                  {canDelete && (
                    <div className="cafeteria-actions">
                      <button
                        type="button"
                        className="btn_agregar"
                        onClick={() => handleDelete(cafe)}
                        disabled={deletingIds.includes(cafe.id)}
                      >
                        {deletingIds.includes(cafe.id)
                          ? "Eliminando..."
                          : "Eliminar cafetería"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ExplorarContent />
    </Suspense>
  );
}
