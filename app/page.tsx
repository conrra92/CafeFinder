import React from "react";
import PublicHeader from "@/components/layout/PublicHeder";

const CafeFinder: React.FC = () => {
  return (
    <div>

      {/* HEADER */}
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
              Descubre cafeterías tranquilas con WiFi de alta velocidad cerca
              de ti. Únete a la comunidad de exploradores productivos.
            </p>

            <form className="buscador">
              <div className="buscador__campo">
                <input type="text" placeholder="Cerca de:" />
              </div>

              <div className="buscador__divisor"></div>

              <div className="buscador__campo">
                <input
                  type="text"
                  placeholder="Nombre de la cafetería o..."
                />
              </div>

              <button className="buscador__boton" type="submit">
                Buscar
              </button>
            </form>

            <div className="filtros">
              <span className="filtro">Wifi de Alta Velocidad</span>
              <span className="filtro">Zona Silenciosa</span>
              <span className="filtro">Enchufes</span>
            </div>
          </div>
        </section>

        {/* CAFETERÍAS */}
        <section className="seccion seccion--destacadas">
          <div className="contenedor">

            <div className="seccion__encabezado">
              <h2 className="seccion__titulo">
                Cafeterías Destacadas por Productividad
              </h2>

              <a href="#todas" className="seccion__ver-todas">
                Ver todas
              </a>
            </div>

            <div className="tarjetas">
              {[
                {
                  nombre: "Starbucks",
                  img: "/img/starbucks-1.png",
                  calificacion: "4.9",
                  puntuacion: "95",
                  subtexto: "Centro • a 2.4 km",
                  etiquetas: ["100 MBPS", "MUY SILENCIOSO"],
                },
                {
                  nombre: "Cielito Lindo",
                  img: "/img/cielito-lindo.png",
                  calificacion: "4.8",
                  puntuacion: "98",
                  subtexto: "Zona Oeste • a 1.1 km",
                  etiquetas: ["50 MBPS", "MUCHOS ENCHUFES"],
                },
                {
                  nombre: "Punta del cielo",
                  img: "/img/punta-del-cielo-1.png",
                  calificacion: "4.7",
                  puntuacion: "92",
                  subtexto: "Norte • a 3.5 km",
                  etiquetas: ["80 MBPS", "REFILL GRATIS"],
                },
              ].map((cafe, index) => (
                <article className="tarjeta" key={index}>

                  <div className="tarjeta__media">
                    <img
                      className="tarjeta__imagen"
                      src={cafe.img}
                      alt={cafe.nombre}
                    />

                    <span className="tarjeta__calificacion">
                      {cafe.calificacion}
                    </span>
                  </div>

                  <div className="tarjeta__contenido">

                    <div className="tarjeta__fila">
                      <h3 className="tarjeta__titulo">
                        {cafe.nombre}
                      </h3>

                      <span className="tarjeta__puntuacion">
                        PUNTUACIÓN {cafe.puntuacion}
                      </span>
                    </div>

                    <p className="tarjeta__subtexto">
                      {cafe.subtexto}
                    </p>

                    <div className="tarjeta__etiquetas">
                      {cafe.etiquetas.map((etiqueta, i) => (
                        <span className="etiqueta" key={i}>
                          {etiqueta}
                        </span>
                      ))}
                    </div>

                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="pie">
        <div className="contenedor">

          <div className="pie__fila-superior">

            <div className="pie__marca">
              <span className="pie__logo-texto">
                CafeFinder
              </span>
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
            <p className="pie__texto-legal">
              © 2026 CafeFinder
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default CafeFinder;