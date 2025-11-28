"use client";
import LoadingSpinner from "./LoadingSpinner";
import { useEffect, useState, useRef } from "react";
import { Marca } from "@/app/types/marca";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarruselMarcasProps {
  title?: string;
  showTitle?: boolean;
}

const MARCAS_VISIBLES = 6;
const INTERVALO = 4000; // ms

export default function CarruselMarcas({
  title = "Nuestras Marcas",
  showTitle = true,
}: CarruselMarcasProps) {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [inicio, setInicio] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const carruselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const res = await fetch("/api/marcas");
        const data = await res.json();
        setMarcas(data);
      } catch (error) {
        console.error("Error al obtener marcas:", error);
      }
    };
    fetchMarcas();
  }, []);

  useEffect(() => {
    if (marcas.length <= MARCAS_VISIBLES) return;

    intervalRef.current = setInterval(() => {
      setInicio((prev) => (prev + 1) % marcas.length);
    }, INTERVALO);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [marcas.length]);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (marcas.length > MARCAS_VISIBLES) {
      intervalRef.current = setInterval(() => {
        setInicio((prev) => (prev + 1) % marcas.length);
      }, INTERVALO);
    }
  };

  const goNext = () => {
    setInicio((prev) => (prev + 1) % marcas.length);
    resetInterval();
  };

  const goPrev = () => {
    setInicio((prev) => (prev - 1 + marcas.length) % marcas.length);
    resetInterval();
  };

  if (marcas.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <LoadingSpinner color_icon="text-ebony-950" color_bg="bg-transparent" />
      </div>
    );
  }

  // Extend brands for infinite loop effect
  const marcasExtendidas = [...marcas, ...marcas.slice(0, MARCAS_VISIBLES)];

  return (
    <section className="py-8 sm:py-10 bg-gray-50">
      <div className="container-padding">
        {showTitle && (
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8">
            {title}
          </h2>
        )}

        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Arrows */}
          {marcas.length > MARCAS_VISIBLES && (
            <>
              <button
                onClick={goPrev}
                aria-label="Anterior"
                className={`absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg
                           transition-all duration-300 hover:bg-gray-50 hover:scale-110
                           ${
                             isHovered
                               ? "opacity-100"
                               : "opacity-0 sm:opacity-70"
                           }`}
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={goNext}
                aria-label="Siguiente"
                className={`absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg
                           transition-all duration-300 hover:bg-gray-50 hover:scale-110
                           ${
                             isHovered
                               ? "opacity-100"
                               : "opacity-0 sm:opacity-70"
                           }`}
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Carousel Container */}
          <div className="overflow-hidden mx-6 sm:mx-10">
            <div
              ref={carruselRef}
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${
                  (inicio * 100) / marcasExtendidas.length
                }%)`,
                width: `${(marcasExtendidas.length / MARCAS_VISIBLES) * 100}%`,
              }}
            >
              {marcasExtendidas.map((marca, idx) => (
                <div
                  key={`${marca.id}-${idx}`}
                  className="flex-shrink-0 px-2 sm:px-4"
                  style={{ width: `${100 / marcasExtendidas.length}%` }}
                >
                  <a
                    href={`/productos?marca=${encodeURIComponent(
                      marca.nombre
                    )}`}
                    title={marca.nombre}
                    className="block bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md 
                             transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="aspect-[3/2] flex items-center justify-center">
                      <img
                        src={
                          !marca.imagen_logo || marca.imagen_logo === "null"
                            ? "https://via.placeholder.com/200x100?text=Logo"
                            : marca.imagen_logo
                        }
                        alt={`Logo de ${marca.nombre}`}
                        className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 
                                 transition-all duration-300"
                        draggable={false}
                      />
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
