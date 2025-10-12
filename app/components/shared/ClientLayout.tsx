// components/shared/ClientLayout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/app/context/CartContext";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

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
        {!hideNavbar && <Navbar />}
        {children}
        <Footer />
      </CartProvider>
    </SessionProvider>
  );
}
