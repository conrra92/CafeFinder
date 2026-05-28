"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PublicHeader from "@/components/layout/PublicHeder";
import { getDisplayRating } from "@/lib/cafeteria-rating";

type FeatureKey = "wifi" | "silenciosa" | "enchufes";

interface Cafeteria {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  foto?: string;
  rating?: number;
  displayRating?: number;
  features?: FeatureKey[];
}

const featureLabels: Record<FeatureKey, string> = {
  wifi: "Wifi de Alta Velocidad",
  silenciosa: "Zona Silenciosa",
  enchufes: "Enchufes",
};

const featureOrder: FeatureKey[] = ["wifi", "silenciosa", "enchufes"];

export default function FeaturePage() {
  const params = useParams<{ feature?: string }>();
  const feature = (params.feature as FeatureKey | undefined) ?? null;
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [loading, setLoading] = useState(true);

  const isValidFeature = feature !== null && featureOrder.includes(feature);

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
            rating: data.rating,
            features: data.features,
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

  const filteredCafes = useMemo(() => {
    if (!isValidFeature) {
      return [];
    }

    return cafeterias.filter((cafe) => (cafe.features ?? []).includes(feature));
  }, [cafeterias, feature, isValidFeature]);

  return (
    <div>
      <PublicHeader />

      <main className="contenedor" style={{ padding: "40px 0 80px" }}>
        <div className="seccion__encabezado">
          <div>
            <h1 className="seccion__titulo" style={{ marginLeft: 0 }}>
              {isValidFeature
                ? `Cafeterías con ${featureLabels[feature]}`
                : "Filtro no disponible"}
            </h1>
            <p className="tarjeta__subtexto" style={{ marginTop: 12 }}>
              Explora las cafeterías que cuentan con esta característica.
            </p>
          </div>

          <Link href="/" className="filtro">
            Volver al inicio
          </Link>
        </div>

        {loading ? (
          <p className="loading">Cargando cafeterías...</p>
        ) : !isValidFeature ? (
          <p className="loading">El filtro solicitado no existe.</p>
        ) : filteredCafes.length === 0 ? (
          <p className="loading">
            No hay cafeterías con esta característica por el momento.
          </p>
        ) : (
          <div className="tarjetas">
            {filteredCafes.map((cafe) => (
              <Link
                href={`/cafeterias/${cafe.id}`}
                key={cafe.id}
                className="tarjeta tarjeta--clickable"
              >
                <div className="tarjeta__media">
                  {cafe.foto ? (
                    <img
                      className="tarjeta__imagen"
                      src={cafe.foto}
                      alt={cafe.nombre}
                    />
                  ) : (
                    <div className="tarjeta__imagen tarjeta__imagen--placeholder">
                      Sin imagen ☕
                    </div>
                  )}

                  <span className="tarjeta__calificacion">
                    {(cafe.displayRating ?? cafe.rating ?? 0).toFixed(1)}
                  </span>
                </div>

                <div className="tarjeta__contenido">
                  <div className="tarjeta__fila">
                    <h3 className="tarjeta__titulo">{cafe.nombre}</h3>
                    <span className="tarjeta__puntuacion">
                      CALIFICACIÓN {(cafe.displayRating ?? cafe.rating ?? 0).toFixed(1)}
                    </span>
                  </div>

                  <p className="tarjeta__subtexto">{cafe.ubicacion}</p>
                  <p className="descripcion">{cafe.descripcion}</p>

                  <div className="tarjeta__etiquetas">
                    {(cafe.features ?? []).map((item) => (
                      <span className="etiqueta" key={item}>
                        {featureLabels[item]}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
