"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * NavigationProgress
 *
 * Barra de progreso que aparece en la parte superior de la página
 * durante la navegación entre páginas.
 *
 * Sigue las heurísticas de Nielsen:
 * - Visibilidad del estado del sistema
 * - Feedback inmediato al usuario
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cuando cambia la ruta, inicia la animación
    setIsNavigating(true);
    setProgress(0);

    // Simula progreso rápido al inicio
    const timer1 = setTimeout(() => setProgress(30), 50);
    const timer2 = setTimeout(() => setProgress(60), 150);
    const timer3 = setTimeout(() => setProgress(80), 300);
    const timer4 = setTimeout(() => {
      setProgress(100);
      // Oculta la barra después de completar
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [pathname, searchParams]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Navegando a nueva página"
    >
      <div
        className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-purple-500 transition-all duration-200 ease-out shadow-lg shadow-sky-500/50"
        style={{
          width: `${progress}%`,
          opacity: isNavigating ? 1 : 0,
        }}
      >
        {/* Efecto de brillo */}
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-white/30 animate-shimmer" />
      </div>
    </div>
  );
}
