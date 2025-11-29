import React from "react";
import { ShoppingBag } from "lucide-react";

interface LoadingSpinnerProps {
  color_icon?: string;
  color_bg?: string;
}

const LoadingSpinner = ({
  color_icon = "text-ebony-950",
  color_bg = "bg-transparent",
}: LoadingSpinnerProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen ${color_bg} gap-6`}
    >
      <div className="flex items-center justify-center">
        <ShoppingBag
          className={`w-20 h-20 animate-spin-slow ${color_icon} drop-shadow-lg`}
          style={{
            animation:
              "spin 1.2s linear infinite, pulse 2s ease-in-out infinite",
          }}
        />
      </div>
      <span
        className={`${color_icon} text-lg font-semibold tracking-wide animate-pulse`}
      >
        Cargando ecloudi...
      </span>
      <style jsx global>{`
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin 1.2s linear infinite, pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            filter: brightness(1);
            transform: scale(1);
          }
          50% {
            filter: brightness(1.2);
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
