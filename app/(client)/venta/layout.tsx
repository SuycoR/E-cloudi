"use client";

import { usePathname } from "next/navigation";
import CheckoutHeader from "../../components/shared/CheckoutHeader";
import React from "react";
import { CheckoutProvider } from "@/app/context/CheckoutContext";

/**
 * CheckoutLayout
 *
 * Un layout dedicado al funnel de ventas:
 * — Sin NavBar global
 * — Encabezado con logo + stepper horizontal estilo línea de tiempo
 * — Paso actual resaltado; pasos completados marcados con un check ✅
 * — Diseño horizontal limpio y centrado
 *
 * Ubica tus páginas de checkout bajo la carpeta `app/(checkout)/` para heredar este layout.
 * Ajusta el array `steps` si cambias la estructura de rutas.
 */

const steps = [
  { href: "/usuario/ventas", label: "Mi cesta" },
  { href: "/usuario/ventas/direccion", label: "Dirección de envío" },
  { href: "/usuario/ventas/metodo", label: "Método de entrega" }, 
  { href: "/usuario/ventas/pago", label: "Pago y resumen" },
];

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <CheckoutProvider>
      <main className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header con logo y stepper */}
        <CheckoutHeader />

        {/* Contenido del paso */}
        <section className="min-h-screen bg-ebony-50">
          <div className="container-padding">
            <div className="w-full mx-auto py-8">{children}</div>
          </div>
        </section>
      </main>
    </CheckoutProvider>
  );
}
