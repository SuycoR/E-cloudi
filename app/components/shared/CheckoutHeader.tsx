"use client";

import { usePathname } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import React from "react";

const steps = [
  { href: "/venta/carro-compras", label: "Carrito de compras" },
  { href: "/venta/metodo-pago", label: "Entrega y pago" },
  { href: "/venta/resumen", label: "Confirmación" },
];

export default function CheckoutHeader() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex((step) =>
    pathname.startsWith(step.href)
  );

  return (
    <header className="bg-gray-50 shadow-sm border-b">
      <div className="container-padding py-6">
        <div className="flex items-center justify-between gap-8">
          {/* Logo alineado a la izquierda */}
          <button
            className="flex items-center gap-4 sm:gap-4 lg:gap-4 cursor-pointer flex-shrink-0"
            aria-label="Inicio"
            onClick={() => (window.location.href = "/")}
          >
            <div className="bg-white flex items-center justify-center rounded-lg w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 shadow-sm">
              <ShoppingBag className="text-slate-700 w-4 h-4 sm:w-6 sm:h-6 lg:w-10 lg:h-10" />
            </div>
            <h1 className="text-slate-700 text-lg sm:text-xl lg:text-2xl font-bold">
              StyleHub
            </h1>
          </button>

          {/* Stepper horizontal */}
          <div className="relative flex items-center flex-1 max-w-4xl">
            {/* Línea de fondo completa */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-300 z-0"></div>

            {/* Línea de progreso */}
            <div
              className="absolute top-4 left-4 h-0.5 bg-ebony-600 z-0 transition-all duration-300"
              style={{
                width:
                  currentIndex >= 0
                    ? `${(currentIndex / (steps.length - 1)) * 100}%`
                    : "0%",
              }}
            ></div>

            {/* Steps */}
            <ol className="relative flex justify-between items-center w-full z-10">
              {steps.map((step, idx) => {
                const isPast = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const isNotStarted = idx > currentIndex;

                return (
                  <li key={step.href} className="flex flex-col items-center">
                    {/* Círculo/Check */}
                    <div
                      className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 mb-3 font-bold text-sm transition-all duration-200",
                        {
                          "border-gray-300 text-gray-400 bg-white":
                            isNotStarted,
                          "border-ebony-600 text-white bg-ebony-600": isCurrent,
                          "border-ebony-600 bg-ebony-600 text-white": isPast,
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
                          "font-semibold text-ebony-700": isCurrent,
                          "font-medium text-ebony-600": isPast,
                          "text-gray-500": isNotStarted,
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
