"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase-client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (password !== confirm) {
      setErr("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);

      // 👉 después de registrarse lo mandamos a login
      router.push("/login");

    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <h2>Crear cuenta</h2>

        <form onSubmit={handleSignup}>

          {/* Email */}
          <label>Email</label>
          <input
            type="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@dominio.com"
            required
          />

          {/* Password */}
          <label>Contraseña</label>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />

          {/* Confirmar */}
          <label>Confirmar contraseña</label>
          <input
            type="password"
            className="login-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="********"
            required
          />

          {/* Error */}
          {err && <p className="login-error">{err}</p>}

          {/* Botón */}
          <button className="login-btn" type="submit">
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        {/* Ir a login */}
        <p className="login-register">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login">Inicia sesión</Link>
        </p>

      </div>
    </div>
  );
}