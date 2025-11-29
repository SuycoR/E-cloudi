"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, X, AlertCircle, Info, ShoppingCart } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "cart";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  productImage?: string;
  productName?: string;
}

/**
 * Toast Component - Notificación temporal
 *
 * Sigue las Heurísticas de Nielsen:
 * - #1 Visibilidad del estado del sistema: Informa al usuario sobre el resultado de sus acciones
 * - #9 Ayuda a los usuarios a reconocer, diagnosticar y recuperarse de errores: Muestra mensajes claros
 * - #4 Consistencia y estándares: Diseño uniforme en toda la aplicación
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  duration = 4000,
  onClose,
  productImage,
  productName,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const icons = {
    success: <CheckCircle2 className="w-6 h-6 text-green-500" />,
    error: <AlertCircle className="w-6 h-6 text-red-500" />,
    info: <Info className="w-6 h-6 text-sky-500" />,
    cart: <ShoppingCart className="w-6 h-6 text-green-500" />,
  };

  const backgrounds = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-sky-50 border-sky-200",
    cart: "bg-white border-gray-200",
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full transform transition-all duration-300 ease-out
        ${
          isVisible && !isLeaving
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }
      `}
    >
      <div
        className={`${backgrounds[type]} border rounded-2xl shadow-xl overflow-hidden`}
      >
        {/* Header con gradiente para el tipo cart */}
        {type === "cart" && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white">
                ¡Añadido al carrito!
              </span>
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Imagen del producto para tipo cart */}
            {type === "cart" && productImage ? (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={productImage}
                  alt={productName || "Producto"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex-shrink-0">{icons[type]}</div>
            )}

            <div className="flex-1 min-w-0">
              {type === "cart" && productName ? (
                <>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {productName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{message}</p>
                </>
              ) : (
                <p className="text-sm font-medium text-gray-900">{message}</p>
              )}
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Barra de progreso para indicar tiempo restante - Nielsen #1 */}
          <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ease-linear ${
                type === "cart"
                  ? "bg-green-500"
                  : type === "error"
                  ? "bg-red-500"
                  : type === "info"
                  ? "bg-sky-500"
                  : "bg-green-500"
              }`}
              style={{
                width: "100%",
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
