"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { ToastType } from "../components/ui/Toast";

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  productImage?: string;
  productName?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    options?: {
      productImage?: string;
      productName?: string;
      duration?: number;
    }
  ) => void;
  showCartToast: (productName: string, productImage?: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * ToastProvider - Proveedor de notificaciones toast
 * 
 * Implementa las Heurísticas de Nielsen:
 * - #1 Visibilidad del estado del sistema: Feedback inmediato de acciones
 * - #5 Prevención de errores: Confirmación de acciones completadas
 * - #9 Ayuda a reconocer errores: Mensajes claros de error
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "success",
      options?: {
        productImage?: string;
        productName?: string;
        duration?: number;
      }
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastData = {
        id,
        message,
        type,
        ...options,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const showCartToast = useCallback(
    (productName: string, productImage?: string) => {
      showToast("Se añadió a tu carrito", "cart", {
        productName,
        productImage,
        duration: 4000,
      });
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, "success");
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, "error", { duration: 5000 });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast(message, "info");
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showCartToast, showSuccess, showError, showInfo }}
    >
      {children}
      {/* Render all active toasts */}
      <div className="fixed bottom-0 right-0 z-[9999] p-4 space-y-3 pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(-${index * 8}px)`,
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              productImage={toast.productImage}
              productName={toast.productName}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return context;
};
