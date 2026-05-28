"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/layout/PublicHeder";
// Usaremos el endpoint del servidor para leer cafeterías (admin)
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

const CafeFinder: React.FC = () => {
  const router = useRouter();
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchMessage, setSearchMessage] = useState("");

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

  const featuredCafes = useMemo(() => {
    return [...cafeterias].sort(
      (a, b) =>
        (b.displayRating ?? b.rating ?? 0) - (a.displayRating ?? a.rating ?? 0)
    );
  }, [cafeterias]);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return cafeterias.filter(
      (cafe) => cafe.nombre.trim().toLowerCase() === normalizedQuery
    );
  }, [cafeterias, query]);

  const destacados = featuredCafes.slice(0, 3);

  return (
    <div>
      <PublicHeader />

      <main>
        <section className="hero">
          <div className="hero__fondo"></div>
          <div className="hero__overlay"></div>

          <div className="contenedor hero__contenido">
            <h1 className="hero__titulo">
              <span className="resaltado">Donde el Enfoque se</span>
              <br />
              <span className="resaltado">Une al Sabor.</span>
            </h1>

            <p className="hero__descripcion">
              Descubre cafeterías tranquilas con WiFi de alta velocidad y
              espacios pensados para tu productividad.
            </p>

            <form
              className="buscador"
              onSubmit={(event) => {
                event.preventDefault();

                const normalizedQuery = searchText.trim().toLowerCase();

                if (!normalizedQuery) {
                  setSearchMessage("Escribe el nombre de una cafetería.");
                  setQuery("");
                  return;
                }

                const matchedCafe = cafeterias.find(
                  (cafe) => cafe.nombre.trim().toLowerCase() === normalizedQuery
                );

                if (matchedCafe) {
                  setSearchMessage("");
                  router.push(`/cafeterias/${matchedCafe.id}`);
                  return;
                }

                setQuery(normalizedQuery);
                setSearchMessage("No existe una cafetería con ese nombre.");
              }}
            >
              <div className="buscador__campo">
                <input
                  type="text"
                  placeholder="Nombre de la cafetería"
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setSearchMessage("");
                  }}
                />
              </div>

              <button className="buscador__boton" type="submit">
                Buscar
              </button>
            </form>

            <div className="filtros">
              {featureOrder.map((feature) => (
                <Link
                  key={feature}
                  href={`/filtros/${feature}`}
                  className="filtro"
                >
                  {featureLabels[feature]}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="seccion seccion--destacadas">
          <div className="contenedor">
            <div className="seccion__encabezado">
              <h2 className="seccion__titulo">
                Cafeterías Destacadas por Productividad
              </h2>
            </div>

            {loading ? (
              <p className="loading">Cargando cafeterías...</p>
            ) : destacados.length === 0 ? (
              <p className="loading">
                No hay cafeterías registradas por el momento.
              </p>
            ) : (
              <div className="tarjetas">
                {destacados.map((cafe) => (
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
                        {(cafe.features ?? []).map((feature) => (
                          <span className="etiqueta" key={feature}>
                            {featureLabels[feature]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {query.trim() && (
          <section className="seccion seccion--busqueda">
            <div className="contenedor">
              <div className="seccion__encabezado">
                <h2 className="seccion__titulo">Resultados de búsqueda</h2>
              </div>

              {searchResults.length === 0 ? (
                <p className="loading">{searchMessage}</p>
              ) : (
                <div className="tarjetas">
                  {searchResults.map((cafe) => (
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
                          {(cafe.features ?? []).map((feature) => (
                            <span className="etiqueta" key={feature}>
                              {featureLabels[feature]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="pie">
        <div className="contenedor">
          <div className="pie__fila-superior">
            <div className="pie__marca">
              <span className="pie__logo-texto">CafeFinder</span>
            </div>

            <nav className="pie__navegacion">
              <a href="#" className="pie__enlace">
                Privacidad
              </a>

              <a href="#" className="pie__enlace">
                Términos
              </a>

              <a href="#" className="pie__enlace">
                Soporte
              </a>

              <a href="#" className="pie__enlace">
                Sobre nosotros
              </a>
            </nav>
          </div>

          <div className="pie__fila-inferior">
            <p className="pie__texto-legal">© 2026 CafeFinder</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CafeFinder;
