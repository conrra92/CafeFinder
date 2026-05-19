import { cookies } from "next/headers";
import PublicHeder from "@/components/layout/PublicHeder";

export default async function Dashboard() {
  const cookieStore = await cookies();

  const cookieName = process.env.SESSION_COOKIE_NAME || "session";
  const session = cookieStore.get(cookieName);

  if (!session) {
    return <h1>No hay sesión válida</h1>;
  }

  return (
    <div>
      <PublicHeder />
      <h1>Bienvenido</h1>;
    </div>
  )
}