"use client";
import React, { useState, useEffect, useRef } from "react";
import { ProductCarouselProps } from "@/app/types/props";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductCarousel({ productos }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState(6); // Default for server
  const [isClient, setIsClient] = useState(false); // Track client-side hydration
  const containerRef = useRef<HTMLDivElement>(null);

  // Detectar hidratación del cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // CONFIGURACIÓN RESPONSIVE: Productos visibles según tamaño de pantalla
  const getVisibleProductsCount = (width: number) => {
    if (width < 640) return 1; // móvil pequeño: 1 producto
    if (width < 768) return 2; // móvil: 2 productos
    if (width < 1024) return 3; // tablet: 3 productos
    if (width < 1280) return 4; // desktop pequeño: 4 productos
    if (width < 1536) return 5; // desktop: 5 productos
    return 6; // desktop grande: 6 productos
  };

  // Calcular dimensiones y productos visibles
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;

        // Determinar cuántos productos mostrar según el ancho
        const newVisibleProducts = getVisibleProductsCount(containerWidth);
        setVisibleProducts(newVisibleProducts);

        // Calcular el ancho que debe tener cada tarjeta
        const gapTotal = (newVisibleProducts - 1) * 16; // gaps de 16px
        const availableWidth = containerWidth - gapTotal;
        const calculatedCardWidth = availableWidth / newVisibleProducts;

        setCardWidth(calculatedCardWidth);

        // Ajustar el índice actual si es necesario (para evitar páginas vacías)
        const newTotalPages = Math.ceil(productos.length / newVisibleProducts);
        const newMaxIndex = Math.max(0, newTotalPages - 1);

        setCurrentIndex((prevIndex) => Math.min(prevIndex, newMaxIndex));
      }
    };

    // Ejecutar al montar y con un pequeño delay
    const timer = setTimeout(updateDimensions, 100);

    // Escuchar cambios de tamaño de ventana
    window.addEventListener("resize", updateDimensions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [productos.length, isClient]);

  // Calcular navegación basada en productos visibles actuales
  const totalPages = Math.ceil(productos.length / visibleProducts);
  const maxIndex = Math.max(0, totalPages - 1);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Calcular el desplazamiento - only apply transform after client hydration
  const translateX = isClient
    ? currentIndex * visibleProducts * (cardWidth + 16)
    : 0;

  // Solo mostrar navegación si hay más productos que los visibles
  const showNavigation = productos.length > visibleProducts;
  
  
  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Botón anterior */}
      {showNavigation && (
        <button
          className={`absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 bg-white rounded-full shadow-md z-10 transition-opacity ${
            currentIndex === 0 ? "hidden" : "hover:bg-gray-50 cursor-pointer"
          }`}
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          aria-label="Productos anteriores"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Container de productos */}
      <div className="overflow-hidden">
        <div
          className="flex gap-2 sm:gap-4 transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${translateX}px)`,
          }}
        >
          {productos.map((producto) => (
            <div
              key={producto.producto_id}
              className="flex-shrink-0"
              style={{ width: cardWidth > 0 ? `${cardWidth}px` : "auto" }}
            >
              <div className="w-full h-full">
                <ProductCard
                  producto_id={producto.producto_id}
                  id_producto_especifico={producto.id_producto_especifico}
                  nombre={producto.nombre}
                  imagen_producto={producto.imagen_producto}
                  precio={producto.precio}
                  porcentaje_desc={producto.porcentaje_desc}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón siguiente */}
      {showNavigation && (
        <button
          className={`absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 bg-white rounded-full shadow-md z-10 transition-opacity ${
            currentIndex >= maxIndex
              ? "hidden"
              : "hover:bg-gray-50 cursor-pointer"
          }`}
          onClick={goToNext}
          disabled={currentIndex >= maxIndex}
          aria-label="Productos siguientes"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" size={20} />
        </button>
      )}

      {/* Indicadores de páginas */}
      {showNavigation && totalPages > 1 && (
        <div className="flex justify-center mt-2 sm:mt-4 gap-1 sm:gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-gray-800" : "bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir a la página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}