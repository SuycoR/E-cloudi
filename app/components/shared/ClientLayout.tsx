// components/shared/ClientLayout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/app/context/CartContext";
import { ToastProvider } from "@/app/context/ToastContext";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import SkipLink from "../ui/SkipLink";
import NavigationProgress from "../ui/NavigationProgress";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Oculta el Navbar si la URL contiene "/venta/"
  const hideNavbar = pathname.includes("/venta/");

  return (
    <SessionProvider>
      <CartProvider>
        <ToastProvider>
          {/* Barra de progreso de navegación */}
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>

          {/* Skip Link para accesibilidad - permite saltar al contenido principal */}
          <SkipLink />

          {!hideNavbar && <Navbar />}
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <ChatWidget />
          <Footer />
        </ToastProvider>
      </CartProvider>
    </SessionProvider>
  );
}
