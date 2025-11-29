"use client";

import { usePathname } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import React from "react";

const steps = [
  { href: "/venta/identificacion", label: "Identificación", step: 1 },
  { href: "/venta/entrega", label: "Entrega", step: 2 },
  { href: "/venta/pago", label: "Pago", step: 3 },
];

/**
 * CheckoutHeader - Header del proceso de checkout
 *
 * Sigue las Heurísticas de Nielsen:
 * - #1 Visibilidad del estado del sistema: Muestra el progreso del usuario en el flujo de compra
 * - #4 Consistencia y estándares: Usa el mismo estilo visual que el header principal
 */
export default function CheckoutHeader() {
  const pathname = usePathname();

  // Calculate current step based on path
  let currentIndex = steps.findIndex((step) => pathname.startsWith(step.href));
  // Handle cart page as pre-step
  if (pathname.includes("carro-compras")) currentIndex = -1;

  return (
    <header className="bg-ebony-950 shadow-lg">
      <div className="container-padding py-4 sm:py-5">
        <div className="flex items-center justify-between gap-6 sm:gap-8">
          {/* Logo - Igual que el Navbar principal */}
          <button
            className="flex items-center gap-3 cursor-pointer flex-shrink-0"
            aria-label="Inicio"
            onClick={() => (window.location.href = "/")}
          >
            <div className="bg-white flex items-center justify-center rounded-full w-10 h-10 sm:w-12 sm:h-12">
              <ShoppingBag className="text-ebony-950 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-white text-xl sm:text-2xl font-bold hidden sm:block">
              ecloudi
            </h1>
          </button>

          {/* Stepper horizontal */}
          <div className="relative flex items-center flex-1 max-w-md sm:max-w-xl">
            {/* Background line */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-white/30 z-0"></div>

            {/* Progress line */}
            <div
              className="absolute top-4 left-8 h-0.5 bg-sky-400 z-0 transition-all duration-500"
              style={{
                width:
                  currentIndex >= 0
                    ? `calc(${(currentIndex / (steps.length - 1)) * 100}% - ${
                        currentIndex === steps.length - 1 ? "0px" : "0px"
                      })`
                    : "0%",
              }}
            ></div>

            {/* Steps */}
            <ol className="relative flex justify-between items-center w-full z-10">
              {steps.map((step, idx) => {
                const isPast = idx < currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <li key={step.href} className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2 font-bold text-sm transition-all duration-300",
                        {
                          "border-white/50 text-white/50 bg-transparent":
                            !isCurrent && !isPast,
                          "border-sky-400 text-white bg-sky-500":
                            isCurrent || isPast,
                        }
                      )}
                    >
                      {isPast ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span>{step.step}</span>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={clsx(
                        "text-xs sm:text-sm text-center leading-tight font-medium",
                        {
                          "text-sky-300": isCurrent || isPast,
                          "text-white/50": !isCurrent && !isPast,
                        }
                      )}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Spacer for balance */}
          <div className="w-10 sm:w-24 flex-shrink-0"></div>
        </div>
      </div>
    </header>
  );
}
