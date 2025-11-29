"use client";
import React from "react";

interface ProductCardSkeletonProps {
  count?: number;
}

const ProductCardSkeleton = ({ count = 1 }: ProductCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="flex flex-col bg-white shadow-md w-full mx-auto relative gap-1 rounded-xl overflow-hidden p-2 sm:p-3 lg:p-4 animate-pulse"
          aria-label="Cargando producto..."
          role="status"
        >
          {/* Skeleton de la imagen */}
          <div className="w-full h-48 sm:h-56 lg:h-64 bg-gray-200 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
          </div>

          {/* Skeleton de los datos */}
          <div className="flex flex-col w-full px-1 sm:px-2 mt-2">
            {/* Skeleton del título */}
            <div className="mb-2 space-y-2">
              <div className="h-4 bg-gray-200 rounded-md w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
              </div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
              </div>
            </div>

            {/* Skeleton del precio */}
            <div className="flex items-center gap-2 mt-auto">
              <div className="h-6 bg-gray-200 rounded-md w-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Screen reader text */}
          <span className="sr-only">Cargando información del producto</span>
        </article>
      ))}
    </>
  );
};

export default ProductCardSkeleton;
