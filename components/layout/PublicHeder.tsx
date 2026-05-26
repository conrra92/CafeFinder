"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase-client";

import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

interface PublicHeaderProps {
  isLogin?: boolean;
}

const isAdminEmail = (email?: string | null) =>
  email?.toLowerCase() === "admin@admin.com";

export default function PublicHeader({
  isLogin = false,
}: PublicHeaderProps) {

  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    await signOut(auth);

    setMenuOpen(false);

    router.push("/");
  }

  return (
    <header className="encabezado">

      <div className="contenedor_encabezado">

        {/* LOGO */}
        <Link href="/" className="brand">
          <img src="/img/logo.svg" alt="CafeFinder" />
          <span className="brand-text">CafeFinder</span>
        </Link>

        {/* NAVEGACIÓN */}
        <nav className="navegacion">

          <button
            className="btn_explorar"
            onClick={() => router.push("/explorar")}>
            Explorar
          </button>

          {/* ESPERAR A FIREBASE */}
          {!loading && (
            <>
              {/* SI NO HAY SESIÓN */}
              {!user ? (

                !isLogin && (
                  <Link href="/login" className="btn_login">
                    Iniciar Sesión
                  </Link>
                )

              ) : (

                /* SI HAY SESIÓN */
                <div className="user-menu">

                  {/* CÍRCULO USUARIO */}
                  <div
                    className="user-avatar"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >

                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Usuario"
                        className="avatar-img"
                      />
                    ) : (
                      user.email?.charAt(0).toUpperCase()
                    )}

                  </div>

                  {/* MENÚ */}
                  {menuOpen && (
                    <div className="dropdown-menu">

                      <p>{user.email}</p>

                      <button onClick={handleLogout}>
                        Cerrar sesión
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            className="btn_agregar"
                            onClick={() => router.push("/agregarcafeteria")}>
                            Añadir Cafetería
                          </button>

                          <button
                            className="btn_agregar"
                            onClick={() => router.push("/explorar?mode=delete")}>
                            Eliminar cafeterías
                          </button>
                        </>
                      )}

                    </div>
                  )}

                </div>

              )}
            </>
          )}

        </nav>

      </div>

    </header>
  );
}