"use client";

import { usePathname } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import React from "react";

const steps = [
  { href: "/usuario/ventas", label: "Mi cesta" },
  { href: "/usuario/ventas/direccion", label: "Dirección de envío" },
  { href: "/usuario/ventas/metodo", label: "Método de pago" },
  { href: "/usuario/ventas/pago", label: "Pago y resumen" },
];

export default function CheckoutHeader() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex((step) =>
    pathname.startsWith(step.href)
  );

  return (
    <header className="bg-white shadow-sm border-b w-full">
      <div className="container-padding w-full">
        <div className="max-w-6xl mx-auto py-6 flex items-center justify-center gap-8">
          {/* Logo alineado a la izquierda */}
          <button
            className="flex items-center gap-3 sm:gap-4 lg:gap-6 cursor-pointer"
            aria-label="Inicio"
            onClick={() => (window.location.href = "/")}
          >
            <div className="bg-white flex items-center justify-center rounded-full w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14">
              <ShoppingBag className="text-ebony-950 w-4 h-4 sm:w-6 sm:h-6 lg:w-10 lg:h-10" />
            </div>
            <h1 className="text-ebony-800  text-lg sm:text-xl lg:text-2xl font-bold">
              CompX
            </h1>
          </button>

          {/* Stepper horizontal */}
          <div className="relative flex items-center max-w-4xl flex-1 px-4">
            {/* Línea de conexión de fondo */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0"></div>

            {/* Línea de progreso */}
            <div
              className="absolute top-4 left-4 h-0.5 bg-orange-500 z-0 transition-all duration-300"
              style={{
                width:
                  currentIndex >= 0
                    ? `calc(${(currentIndex / (steps.length - 1)) * 100}% - 2rem + 16px)`
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
                    {/* Círculo/Check */}
                    <div
                      className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 mb-3 font-bold text-sm bg-white",
                        {
                          "border-gray-300 text-gray-400":
                            !isCurrent && !isPast,
                          "border-orange-500 text-orange-500": isCurrent,
                          "border-orange-500 bg-orange-500 text-white":
                            isPast,
                        }
                      )}
                    >
                      {isPast ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={clsx(
                        "text-xs sm:text-sm text-center max-w-[100px] leading-tight",
                        {
                          "font-semibold text-orange-600": isCurrent,
                          "font-medium text-orange-600": isPast,
                          "text-gray-500": !isCurrent && !isPast,
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
        </div>
      </div>
    </header>
  );
}
