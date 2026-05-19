import "./globals.css";
import PublicHeader from "../components/layout/PublicHeder";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}

      </body>
    </html>
  );
}