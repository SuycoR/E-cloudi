"use client";
import React, { useState } from "react";
import type { ProductCardProps } from "@/app/types/props";
import Loadingspinner from "../ui/LoadingSpinner";
import { useCart } from "@/app/context/CartContext";
import type { CartItem } from "@/app/types/itemCarrito";
import { useStock } from '@/app/hooks/useStock';
import Link from "next/link";
import { AddToCartButton } from '@/app/components/ui/AddToCartButton';

const ProductCard = ({
  producto_id,
  id_producto_especifico,
  nombre,
  imagen_producto,
  precio,
  porcentaje_desc,
}: ProductCardProps) => {
  // Always call the hook, but handle the conditional logic inside
  const { stock } = useStock(id_producto_especifico || 0);
  const isValidProduct = id_producto_especifico !== undefined;

  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Si hay descuento, calculamos el precio final y el porcentaje de descuento
  const precioFinal = porcentaje_desc ? precio * (1 - porcentaje_desc) : precio;
  const porcentajeDescuento = porcentaje_desc
    ? Math.round(porcentaje_desc * 100)
    : null;

  // Manejar el error de carga de imagen
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Importante: marcamos como "cargado" para ocultar el spinner
  };

  console.log("Producto en ProductCard:", {
    producto_id,
    id_producto_especifico,
    nombre,
    imagen_producto,
    precio,
    porcentaje_desc,
  });

  return (
    <div className="group flex flex-col bg-white shadow-md hover:shadow-xl w-full mx-auto relative gap-1 rounded-xl transition-all duration-300 overflow-hidden p-2 sm:p-3 lg:p-4">
      {/* Container de la imagen */}
      <div
        className="w-full h-48 sm:h-56 lg:h-64 flex justify-center items-center relative cursor-pointer overflow-hidden p-2 sm:p-3 lg:p-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Loading Spinner - solo se muestra mientras carga */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse flex items-center justify-center">
            <Loadingspinner />
          </div>
        )}

        {/* Imagen principal */}
        {!imageError && (
          <Link href={`/productos/${id_producto_especifico}`} prefetch={true}>
            <img
              className={`w-auto h-auto max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105 sm:group-hover:scale-110 cursor-pointer ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              src={
                !imagen_producto || imagen_producto === "null"
                  ? "https://img.freepik.com/vector-gratis/ilustracion-icono-doodle-engranaje_53876-5596.jpg?semt=ais_hybrid&w=740"
                  : imagen_producto
              }
              alt={nombre}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              loading="lazy"
            />
          </Link>
        )}

        {/* Overlay con boton para agregar carrito */}
        <div
          className={`absolute right-1 top-1 sm:right-2 sm:top-2 flex items-center transition-all duration-300 ease-out ${
            isHovered ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          

          <AddToCartButton
            productId={id_producto_especifico}
            nombre={nombre}
            precio={precio}
            imagen={imagen_producto}
            className="your-optional-custom-classes"
          />
        </div>
      </div>

      {/* Etiqueta de descuento*/}
      {porcentaje_desc != 0 && (
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-600 text-white text-xs sm:text-sm p-1.5 sm:p-2 rounded-md sm:rounded-lg shadow-md">
          <span className="font-semibold">{porcentajeDescuento}% OFF</span>
        </div>
      )}

      {/* Datos */}
      <div className="flex flex-col w-full px-1 sm:px-2">
        <div className="mb-2">
          <h3 className="text-sm sm:text-base lg:text-lg font-medium h-12 sm:h-14 lg:h-16 overflow-hidden line-clamp-3 text-gray-800">
            {nombre}
          </h3>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          {porcentaje_desc != 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-lg sm:text-xl lg:text-2xl text-red-600 font-bold">
                S/ {precioFinal.toFixed(2)}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                S/ {precio}
              </span>
            </div>
          ) : (
            <>
              <span className="text-lg sm:text-xl lg:text-2xl text-slate-800 font-bold">
                S/ {precio}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;