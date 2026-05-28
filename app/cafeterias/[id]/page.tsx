"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import PublicHeader from "@/components/layout/PublicHeder";
import { auth } from "@/lib/firebase-client";

type FeatureKey = "wifi" | "silenciosa" | "enchufes";

type Review = {
  id: string;
  userId: string;
  userEmail: string;
  comment: string;
  rating: number;
  createdAt?: unknown;
};

interface Cafeteria {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  foto?: string;
  rating?: number;
  features?: FeatureKey[];
}

const featureLabels: Record<FeatureKey, string> = {
  wifi: "WiFi de alta velocidad",
  silenciosa: "Zona silenciosa",
  enchufes: "Enchufes",
};

const formatDate = (value?: unknown) => {
  if (!value) {
    return "Ahora";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return "Ahora";
};

export default function CafeteriaDetallePage() {
  const params = useParams<{ id?: string }>();
  const cafeId = params.id;

  const [cafe, setCafe] = useState<Cafeteria | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [commentText, setCommentText] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!cafeId) {
      setLoading(false);
      return;
    }

    async function cargarDetalle() {
      try {
        setLoading(true);

        const id = cafeId;

        if (!id) {
          setCafe(null);
          return;
        }
        const res = await fetch("/api/cafeterias");
        const json = await res.json();

        const all = json.data || [];
        const found = all.find((c: any) => c.id === id);

        if (!found) {
          setCafe(null);
          setReviews([]);
          return;
        }

        setCafe({
          id: found.id,
          nombre: String(found.nombre ?? "Cafetería"),
          ubicacion: String(found.ubicacion ?? "Ubicación no disponible"),
          descripcion: String(found.descripcion ?? "Sin descripción"),
          foto: typeof found.foto === "string" ? found.foto : undefined,
          rating: typeof found.rating === "number" ? found.rating : 0,
          features: Array.isArray(found.features) ? found.features : [],
        });

        setReviews(
          (found.reviews || []).map((reviewDoc: any) => ({
            id: reviewDoc.id || Math.random().toString(36).slice(2, 9),
            userId: String(reviewDoc.userId ?? ""),
            userEmail: String(reviewDoc.userEmail ?? "Usuario"),
            comment: String(reviewDoc.comment ?? ""),
            rating: typeof reviewDoc.rating === "number" ? reviewDoc.rating : 0,
            createdAt: reviewDoc.createdAt,
          }))
        );
      } catch (error) {
        console.error(error);
        setCafe(null);
      } finally {
        setLoading(false);
      }
    }

    cargarDetalle();
  }, [cafeId]);

  const userAverage = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const total = reviews.reduce((acc, review) => acc + review.rating, 0);

    return total / reviews.length;
  }, [reviews]);

  const overallRating = useMemo(() => {
    const adminRating = cafe?.rating ?? 0;

    if (!userAverage) {
      return adminRating;
    }

    return (adminRating + userAverage) / 2;
  }, [cafe?.rating, userAverage]);

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cafe || !user) {
      setReviewMessage("Inicia sesión para calificar y comentar esta cafetería.");
      return;
    }

    if (!commentText.trim()) {
      setReviewMessage("Escribe un comentario antes de enviar tu reseña.");
      return;
    }

    try {
      setIsSavingReview(true);
      setReviewMessage("");

      const response = await fetch("/api/cafeterias/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeId: cafe.id,
          userId: user.uid,
          userEmail: user.email ?? "Usuario",
          comment: commentText.trim(),
          rating: Number(userRating),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo guardar la reseña");
      }

      setReviews((current) => [
        {
          id: data.id,
          userId: user.uid,
          userEmail: user.email ?? "Usuario",
          comment: commentText.trim(),
          rating: Number(userRating),
        },
        ...current,
      ]);

      setCommentText("");
      setUserRating(5);
      setReviewMessage("¡Gracias! Tu reseña ya quedó guardada.");
    } catch (error) {
      console.error(error);
      setReviewMessage("No pudimos guardar tu reseña. Inténtalo de nuevo.");
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div className="detalle-page-shell">
      <PublicHeader />

      <main className="contenedor detalle-page">
        <div className="detalle-breadcrumbs">
          <Link href="/" className="detalle-back">
            ← Volver al inicio
          </Link>
        </div>

        {loading ? (
          <div className="detalle-loading">Cargando detalles...</div>
        ) : !cafe ? (
          <div className="detalle-empty">
            <h1>Cafetería no encontrada</h1>
            <p>La cafetería que buscas no existe o fue eliminada.</p>
            <Link href="/" className="detalle-back">
              Volver al inicio
            </Link>
          </div>
        ) : (
          <section className="detalle-hero">
            <div className="detalle-hero__image">
              {cafe.foto ? (
                <img src={cafe.foto} alt={cafe.nombre} className="detalle-image" />
              ) : (
                <div className="detalle-image detalle-image--placeholder">
                  Sin imagen ☕
                </div>
              )}
            </div>

            <div className="detalle-hero__content">
              <p className="detalle-eyebrow">Cafetería destacada</p>
              <h1 className="detalle-title">{cafe.nombre}</h1>
              <p className="detalle-location">{cafe.ubicacion}</p>
              <p className="detalle-description">{cafe.descripcion}</p>

              <div className="detalle-badges">
                {(cafe.features ?? []).map((feature) => (
                  <span key={feature} className="detalle-badge">
                    {featureLabels[feature]}
                  </span>
                ))}
              </div>

              <div className="detalle-stats">
                <div className="detalle-stat">
                  <span>Calificación total</span>
                  <strong>{overallRating.toFixed(1)} / 5</strong>
                </div>
                <div className="detalle-stat">
                  <span>Calificación admin</span>
                  <strong>{(cafe.rating ?? 0).toFixed(1)} / 5</strong>
                </div>
                <div className="detalle-stat">
                  <span>Reseñas de usuarios</span>
                  <strong>{reviews.length}</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {cafe && (
          <section className="detalle-grid">
            <div className="detalle-card detalle-map-card">
              <div>
                <p className="detalle-eyebrow">Ubicación</p>
                <h2 className="detalle-section-title">Dirección y mapa</h2>
                <p className="detalle-map-copy">{cafe.ubicacion}</p>
              </div>

              <iframe
                title={`Mapa de ${cafe.nombre}`}
                className="detalle-map-frame"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  cafe.ubicacion
                )}&output=embed`}
              />
            </div>

            <div className="detalle-card detalle-review-card">
              <div>
                <p className="detalle-eyebrow">Comunidad</p>
                <h2 className="detalle-section-title">Califica y comenta</h2>
              </div>

              {!user ? (
                <p className="detalle-note">
                  Inicia sesión para dejar una calificación y un comentario.
                </p>
              ) : (
                <form className="detalle-form" onSubmit={handleSubmitReview}>
                  <label className="detalle-field">
                    <span>Tu calificación</span>
                    <select
                      value={userRating}
                      onChange={(event) => setUserRating(Number(event.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} estrellas
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="detalle-field">
                    <span>Tu comentario</span>
                    <textarea
                      rows={5}
                      placeholder="Describe tu experiencia en esta cafetería"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                    />
                  </label>

                  <button type="submit" className="detalle-submit" disabled={isSavingReview}>
                    {isSavingReview ? "Guardando..." : "Enviar reseña"}
                  </button>
                </form>
              )}

              {reviewMessage && <p className="detalle-note">{reviewMessage}</p>}

              <div className="detalle-comments">
                <h3>Comentarios recientes</h3>

                {reviews.length === 0 ? (
                  <p className="detalle-empty-comment">
                    Aún no hay comentarios para esta cafetería.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <article className="comment-card" key={review.id}>
                      <div className="comment-card__header">
                        <strong>{review.userEmail}</strong>
                        <span>{review.rating.toFixed(1)} / 5</span>
                      </div>
                      <p>{review.comment}</p>
                      <small>{formatDate(review.createdAt)}</small>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}