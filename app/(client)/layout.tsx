// app/layout.tsx
import type { Metadata } from "next";
import ClientLayout from "../components/shared/ClientLayout";
import "@/app/globals.css";
// Agregando google analytcis
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "E-Cloudi",
  description:
    "Tienda online de moda y accesorios ecloudi - Compra ropa, calzado y más con envío a todo Perú",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ClientLayout>{children}</ClientLayout>
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ""}
        />
      </body>
    </html>
  );
}
