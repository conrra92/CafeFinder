"use client";

import PublicHeder from "@/components/layout/PublicHeder";
import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, configureAuthPersistence } from "@/lib/firebase-client";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";

import { useState } from "react";
import PublicHeader from "@/components/layout/PublicHeder";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get("redirectTo") ?? "/dashboard";

  async function sessionLogin() {
    const idToken = await auth.currentUser?.getIdToken(true);
    if (!idToken) throw new Error("No idToken");
    const res = await fetch("/api/sessionLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, remember }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error ?? "No se pudo crear la sesión");
    }
  }

  async function onEmailPass(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await configureAuthPersistence(remember);
      await signInWithEmailAndPassword(auth, email, password);
      await sessionLogin();
      router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PublicHeder />
      <div className="login-container">
        <div className="login-card">

          <h2>Iniciar sesión</h2>
          
          <form onSubmit={onEmailPass}>

            {/* Email */}
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="tucorreo@dominio.com"
              required
            />

            {/* Password */}
            <label>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="********"
                required
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#aaa",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                {showPass ? "Ocultar" : "Ver"}
              </button>
            </div>

            {/* Error */}
            {err && <p className="login-error">{err}</p>}
                  
            {/* Botón login */}
              <button type="submit" className="login-btn">
                {loading ? "Entrando..." : "Entrar"}
              </button>
          </form>

          {/* Separador */}
          <div className="login-separator">
            <span>o</span>
          </div>

          {/* Google */}
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
                await sessionLogin();
                router.push("/dashboard");
              } catch (e: any) {
                setErr(e.message);
              } finally {
                setLoading(false);
              }
            }}
            className="google-btn"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
              alt="google"
            />
          </button>

          {/* Registro */}
          <p className="login-register">
            ¿No tienes cuenta?{" "}
            <Link href="/signup">Regístrate</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

function Login(){
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}

export default Login;
