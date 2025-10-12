"use client";
import LoadingSpinner from "./LoadingSpinner";
import { useEffect, useState, useRef } from "react";
import { Promocion } from "@/app/types/promocion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CarruselPromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    const fetchPromociones = async () => {
      try {
        const res = await fetch("/api/promociones");
        const data = await res.json();
        setPromociones(data);
      } catch (error) {
        console.error("Error al obtener promociones:", error);
      }
    };
    fetchPromociones();
  }, []);

  useEffect(() => {
    if (!promociones.length) return;
    intervaloRef.current = setInterval(
      () => setIndiceActual((prev) => (prev + 1) % promociones.length),
      4000
    );
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [promociones]);

  const resetearIntervalo = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
    }
    intervaloRef.current = setInterval(
      () => setIndiceActual((prev) => (prev + 1) % promociones.length),
      4000
    );
  };

  const siguiente = () => {
    setIndiceActual((prev) => (prev + 1) % promociones.length);
    resetearIntervalo();
  };

  const anterior = () => {
    setIndiceActual(
      (prev) => (prev - 1 + promociones.length) % promociones.length
    );
    resetearIntervalo();
  };

  const irASlide = (indice: number) => {
    setIndiceActual(indice);
    resetearIntervalo();
  };

  if (!promociones.length) {
    return (
      <div className="w-full max-w-[120rem] mx-auto select-none font-rubik">
        <LoadingSpinner color_icon="text-ebony-950" color_bg="bg-transparent" />
      </div>
    );
  }

  const promo = promociones[indiceActual];

  return (
    <div
      className="w-full max-w-[120rem] mx-auto  select-none  font-rubik"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* Contenedor del carrusel */}
      <div className="relative">
        {/* Contenedor de imagen responsive */}
        <div
          className="w-full overflow-hidden flex items-center justify-center bg-gray-50 rounded-lg
                        h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[30rem] 2xl:h-[40rem]"
        >
          <img
            src={promo.img_promocional}
            alt={promo.nombre}
            draggable={false}
            className="w-full h-full object-cover object-center rounded-lg
                       sm:object-contain sm:max-w-none
                       md:object-cover
                       lg:w-auto lg:h-full lg:max-w-none
                       xl:w-full xl:h-full
                       2xl:w-full 2xl:h-[40rem] 2xl:object-cover"
            style={{
              maskImage:
                "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 60%, rgba(255,255,255,0.95) 80%, rgba(255,255,255,0.8) 92%, rgba(255,255,255,0.3) 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 60%, rgba(255,255,255,0.95) 80%, rgba(255,255,255,0.8) 92%, rgba(255,255,255,0.3) 100%)",
            }}
          />
        </div>

        {/* Flechas de navegación */}
        <button
          onClick={anterior}
          aria-label="Anterior"
          className={`absolute left-2 sm:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 
                     p-2 sm:p-3 bg-white rounded-full shadow-lg z-20 
                     transition-all duration-300 hover:bg-gray-50 cursor-pointer 
                     ${isHover ? "opacity-100" : "opacity-0 sm:opacity-70"}`}
        >
          <ChevronLeft
            className="color-black w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            size={20}
          />
        </button>

        <button
          onClick={siguiente}
          aria-label="Siguiente"
          className={`absolute right-2 sm:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 
                     p-2 sm:p-3 bg-white rounded-full shadow-lg z-20 
                     transition-all duration-300 hover:bg-gray-50 cursor-pointer
                     ${isHover ? "opacity-100" : "opacity-0 sm:opacity-70"}`}
        >
          <ChevronRight
            className="color-black w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
            size={20}
          />
        </button>

        {/* Indicadores circulares */}
        <div
          className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2 
                        flex space-x-2 sm:space-x-3 z-10"
        >
          {promociones.map((_, index) => (
            <button
              key={index}
              onClick={() => irASlide(index)}
              className={`w-1 h-1 sm:w-3 sm:h-3 lg:w-3 lg:h-3 rounded-full 
                         transition-all duration-300 hover:scale-110
                         ${
                           index === indiceActual
                             ? "bg-ebony-800 scale-110 shadow-lg"
                             : "bg-gray-300 bg-opacity-60 hover:bg-opacity-80"
                         }`}
              aria-label={`Ir a promoción ${index + 1}`}
            />
          ))}
        </div>

        {/* Botón "Ver Todo" - COMENTADO */}
        {/* 
        {promociones.length > 1 && (
          <button
            onClick={() => {
              // Navegar a "Ver Todo" 
            }}
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                       bg-gray-900 bg-opacity-80 hover:bg-opacity-100 text-white font-medium 
                       rounded-full px-4 py-2 sm:px-6 sm:py-3 shadow-lg z-20
                       transition-all duration-300 hover:scale-105
                       text-sm sm:text-base
                       ${isHover ? "opacity-100" : "opacity-0"}`}
          >
            Ver Todo
          </button>
        )}
        */}
      </div>

      {/* Información de la promoción - COMENTADA */}
      {/* 
      <div className="mt-4 sm:mt-6 text-center px-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
          {promo.nombre}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto line-clamp-2">
          {promo.descripcion}
        </p>
        {promo.fecha_inicio && promo.fecha_final && (
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            Vigencia: {new Date(promo.fecha_inicio).toLocaleDateString()} –{" "}
            {new Date(promo.fecha_final).toLocaleDateString()}
          </p>
        )}
      </div>
      */}
    </div>
  );
}