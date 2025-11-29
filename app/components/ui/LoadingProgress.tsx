"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
} from "lucide-react";

interface LoadingProgressProps {
  isLoading: boolean;
  progress?: number; // 0-100, si no se proporciona se usa animación indeterminada
  message?: string;
  subMessage?: string;
  type?: "modal" | "inline" | "bar" | "overlay";
  variant?: "default" | "ai" | "checkout" | "products";
  showPercentage?: boolean;
  steps?: { label: string; completed: boolean }[];
  onCancel?: () => void;
  success?: boolean;
  error?: string | null;
}

/**
 * LoadingProgress - Componente de feedback visual para estados de carga
 *
 * Sigue las heurísticas de Nielsen:
 * - #1 Visibilidad del estado del sistema: Muestra progreso y mensajes claros
 * - #9 Ayuda a reconocer, diagnosticar y recuperarse de errores
 * - #10 Ayuda y documentación: Mensajes informativos
 */
export default function LoadingProgress({
  isLoading,
  progress,
  message = "Cargando...",
  subMessage,
  type = "inline",
  variant = "default",
  showPercentage = false,
  steps,
  onCancel,
  success = false,
  error = null,
}: LoadingProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [dots, setDots] = useState("");

  // Animación de puntos suspensivos
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Animación suave del progreso
  useEffect(() => {
    if (progress !== undefined) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Colores según variante
  const getColors = () => {
    switch (variant) {
      case "ai":
        return {
          primary: "from-purple-500 to-pink-500",
          bg: "bg-purple-50",
          text: "text-purple-700",
          icon: "text-purple-500",
          border: "border-purple-200",
        };
      case "checkout":
        return {
          primary: "from-orange-500 to-amber-500",
          bg: "bg-orange-50",
          text: "text-orange-700",
          icon: "text-orange-500",
          border: "border-orange-200",
        };
      case "products":
        return {
          primary: "from-sky-500 to-blue-500",
          bg: "bg-sky-50",
          text: "text-sky-700",
          icon: "text-sky-500",
          border: "border-sky-200",
        };
      default:
        return {
          primary: "from-ebony-600 to-ebony-800",
          bg: "bg-ebony-50",
          text: "text-ebony-700",
          icon: "text-ebony-600",
          border: "border-ebony-200",
        };
    }
  };

  const colors = getColors();

  // Icono según variante
  const getIcon = () => {
    if (success)
      return (
        <CheckCircle2 className="w-8 h-8 text-green-500 animate-bounce-in" />
      );
    if (error) return <AlertCircle className="w-8 h-8 text-red-500" />;

    switch (variant) {
      case "ai":
        return <Sparkles className={`w-8 h-8 ${colors.icon} animate-pulse`} />;
      case "products":
        return <Package className={`w-8 h-8 ${colors.icon} animate-pulse`} />;
      default:
        return <Loader2 className={`w-8 h-8 ${colors.icon} animate-spin`} />;
    }
  };

  if (!isLoading && !success && !error) return null;

  // Barra de progreso simple
  if (type === "bar") {
    return (
      <div
        className="w-full"
        role="progressbar"
        aria-valuenow={animatedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={message}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${colors.text}`}>
            {message}
          </span>
          {showPercentage && progress !== undefined && (
            <span className={`text-sm font-semibold ${colors.text}`}>
              {Math.round(animatedProgress)}%
            </span>
          )}
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${colors.bg}`}>
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colors.primary} transition-all duration-500 ease-out`}
            style={{
              width:
                progress !== undefined ? `${animatedProgress}%` : undefined,
            }}
          >
            {progress === undefined && (
              <div className="h-full w-1/3 bg-white/30 animate-shimmer" />
            )}
          </div>
        </div>
        {subMessage && (
          <p className="text-xs text-gray-500 mt-1">{subMessage}</p>
        )}
      </div>
    );
  }

  // Inline loader
  if (type === "inline") {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 rounded-xl ${colors.bg} ${colors.border} border animate-fade-in`}
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        {getIcon()}
        <p className={`mt-3 font-medium ${colors.text}`}>
          {error ? error : success ? "¡Completado!" : `${message}${dots}`}
        </p>
        {subMessage && !error && !success && (
          <p className="text-sm text-gray-500 mt-1">{subMessage}</p>
        )}

        {/* Barra de progreso */}
        {progress !== undefined && !success && !error && (
          <div className="w-full max-w-xs mt-4">
            <div className={`h-2 rounded-full overflow-hidden bg-white`}>
              <div
                className={`h-full rounded-full bg-gradient-to-r ${colors.primary} transition-all duration-500 ease-out`}
                style={{ width: `${animatedProgress}%` }}
              />
            </div>
            {showPercentage && (
              <p
                className={`text-center text-sm mt-2 font-semibold ${colors.text}`}
              >
                {Math.round(animatedProgress)}%
              </p>
            )}
          </div>
        )}

        {/* Pasos */}
        {steps && steps.length > 0 && (
          <div className="mt-4 space-y-2 w-full max-w-xs">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : `${colors.bg} ${colors.text}`
                  }`}
                >
                  {step.completed ? "✓" : index + 1}
                </div>
                <span
                  className={`text-sm ${
                    step.completed ? "text-gray-500 line-through" : colors.text
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {onCancel && !success && !error && (
          <button
            onClick={onCancel}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancelar
          </button>
        )}
      </div>
    );
  }

  // Modal overlay
  if (type === "modal" || type === "overlay") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loading-title"
        aria-describedby="loading-description"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-scale-in">
          <div className="flex flex-col items-center text-center">
            {getIcon()}

            <h3
              id="loading-title"
              className={`mt-4 text-lg font-semibold ${
                error
                  ? "text-red-700"
                  : success
                  ? "text-green-700"
                  : colors.text
              }`}
            >
              {error ? "Error" : success ? "¡Completado!" : message}
            </h3>

            {(subMessage || error) && (
              <p
                id="loading-description"
                className="text-sm text-gray-500 mt-2"
              >
                {error || subMessage}
              </p>
            )}

            {/* Barra de progreso */}
            {progress !== undefined && !success && !error && (
              <div className="w-full mt-6">
                <div
                  className={`h-3 rounded-full overflow-hidden ${colors.bg}`}
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors.primary} transition-all duration-500 ease-out relative overflow-hidden`}
                    style={{ width: `${animatedProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </div>
                </div>
                {showPercentage && (
                  <p
                    className={`text-center text-lg mt-3 font-bold ${colors.text}`}
                  >
                    {Math.round(animatedProgress)}%
                  </p>
                )}
              </div>
            )}

            {/* Progreso indeterminado */}
            {progress === undefined && !success && !error && (
              <div className="w-full mt-6">
                <div
                  className={`h-2 rounded-full overflow-hidden ${colors.bg} relative`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${colors.primary} animate-progress-indeterminate`}
                  />
                </div>
              </div>
            )}

            {/* Pasos */}
            {steps && steps.length > 0 && !success && !error && (
              <div className="mt-6 space-y-3 w-full text-left">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        step.completed
                          ? "bg-green-500 text-white scale-110"
                          : `${colors.bg} ${colors.text}`
                      }`}
                    >
                      {step.completed ? "✓" : index + 1}
                    </div>
                    <span
                      className={`text-sm transition-all duration-300 ${
                        step.completed
                          ? "text-green-600 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {onCancel && !success && !error && (
              <button
                onClick={onCancel}
                className="mt-6 px-6 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}

            {(success || error) && onCancel && (
              <button
                onClick={onCancel}
                className={`mt-6 px-6 py-2 text-sm text-white rounded-full transition-colors ${
                  success
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {success ? "Continuar" : "Cerrar"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
