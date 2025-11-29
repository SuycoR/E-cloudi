"use client";

import { usePathname } from "next/navigation";
import CheckoutHeader from "../../components/shared/CheckoutHeader";
import React, { useEffect, useState } from "react";
import { CheckoutProvider } from "@/app/context/CheckoutContext";

/**
 * CheckoutLayout
 *
 * Un layout dedicado al funnel de ventas:
 * — Sin NavBar global
 * — Encabezado con logo + stepper horizontal estilo línea de tiempo
 * — Paso actual resaltado; pasos completados marcados con un check ✅
 * — Diseño horizontal limpio y centrado
 * — Transiciones animadas entre pasos
 *
 * Ubica tus páginas de checkout bajo la carpeta `app/(checkout)/` para heredar este layout.
 */

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  // Animación de transición entre páginas del checkout
  useEffect(() => {
    setIsTransitioning(true);
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [pathname, children]);

  return (
    <CheckoutProvider>
      <main className="min-h-screen bg-white flex flex-col">
        {/* Header con logo y stepper */}
        <CheckoutHeader />

        {/* Contenido del paso con transición */}
        <section
          className={`flex-1 bg-white transition-all duration-300 ease-out ${
            isTransitioning
              ? "opacity-0 translate-y-2"
              : "opacity-100 translate-y-0"
          }`}
        >
          {displayChildren}
        </section>
      </main>
    </CheckoutProvider>
  );
}
