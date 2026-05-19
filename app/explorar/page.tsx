"use client";

import { useEffect, useState } from "react";

import { db } from "@/lib/firebase/client";

import {
  collection,
  getDocs,
} from "firebase/firestore";
import PublicHeader from "@/components/layout/PublicHeder";

interface Cafeteria {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  foto: string;
}

export default function ExplorarPage() {

  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function obtenerCafeterias() {

      try {

        const querySnapshot = await getDocs(
          collection(db, "cafeterias")
        );

        const lista: Cafeteria[] = [];

        querySnapshot.forEach((doc) => {

          lista.push({
            id: doc.id,
            ...doc.data(),
          } as Cafeteria);

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

  return (
    <div>
      <PublicHeader />
      <div className="explorar-page">

        <div className="explorar-container">

          <h1 className="explorar-titulo">
            Explorar Cafeterías ☕
          </h1>

          <p className="explorar-subtitulo">
            Descubre cafeterías agregadas por la comunidad
          </p>

          {loading ? (

            <p className="loading">
              Cargando cafeterías...
            </p>

          ) : cafeterias.length === 0 ? (

            <p className="loading">
              No hay cafeterías registradas
            </p>

          ) : (

            <div className="cafeterias-grid">

              {cafeterias.map((cafe) => (

                <div
                  key={cafe.id}
                  className="cafeteria-card"
                >

                  {cafe.foto ? (

                    <img
                      src={cafe.foto}
                      alt={cafe.nombre}
                      className="cafeteria-img"
                    />

                  ) : (

                    <div className="cafeteria-img-placeholder">
                      Sin imagen ☕
                    </div>

                  )}

                  <div className="cafeteria-content">

                    <h2>{cafe.nombre}</h2>

                    <p className="ubicacion">
                      📍 {cafe.ubicacion}
                    </p>

                    <p className="descripcion">
                      {cafe.descripcion}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}