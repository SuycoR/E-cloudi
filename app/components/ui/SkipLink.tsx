"use client";

/**
 * SkipLink - Componente de accesibilidad
 *
 * Permite a los usuarios con lectores de pantalla o navegación por teclado
 * saltar directamente al contenido principal sin tener que navegar por todos
 * los elementos de la barra de navegación.
 */

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export default function SkipLink({
  href = "#main-content",
  children = "Saltar al contenido principal",
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:px-4 focus:py-2 
        focus:bg-ebony-950 focus:text-white 
        focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ebony-950
        transition-all
      "
      aria-label={
        typeof children === "string"
          ? children
          : "Saltar al contenido principal"
      }
    >
      {children}
    </a>
  );
}
