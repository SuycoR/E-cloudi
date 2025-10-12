"use client";
import LoadingSpinner from "./LoadingSpinner";
import { useEffect, useState, useRef } from "react";
import { Marca } from "@/app/types/marca";

const MARCAS_VISIBLES = 6;
const INTERVALO = 3000; // ms

export default function CarruselMarcas() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [inicio, setInicio] = useState(0);
  const [animando, setAnimando] = useState(false);
  const carruselRef = useRef<HTMLDivElement>(null);

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
    if (marcas.length === 0) return;
    const interval = setInterval(() => {
      setAnimando(true);
      setTimeout(() => {
        setInicio((prev) => (prev + 1) % marcas.length);
        setAnimando(false);
      }, 400); 
    }, INTERVALO);
    return () => clearInterval(interval);
  }, [marcas, inicio]);

  const total = marcas.length;

  const marcasExtendidas = [...marcas, ...marcas.slice(0, MARCAS_VISIBLES)];
  const offset = animando ? -100 / MARCAS_VISIBLES : 0;

  if (marcas.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-6">
        <LoadingSpinner color_icon="text-ebony-950" color_bg="bg-transparent" />
      </div>  
    );
  }

  return (
    <div className="w-full overflow-hidden py-6 select-none relative mx-auto max-w-[80rem]">
      <div
        ref={carruselRef}
        className="flex transition-transform duration-400 ease-in-out"
        style={{
          width: `${(marcasExtendidas.length / MARCAS_VISIBLES) * 100}%`,
          transform: `translateX(-${
            (inicio * 100) / marcasExtendidas.length
          }%)`,
        }}
      >
        {marcasExtendidas.map((marca, idx) => (
          <div
            key={marca.id + "-" + idx}
            className="flex flex-col items-center flex-shrink-0"
            style={{
              width: `${100 / marcasExtendidas.length}%`,
              minWidth: 0,
            }}
          >
            <a
              href={`/productos?marca=${encodeURIComponent(marca.nombre)}`}
              title={marca.nombre}
              className="flex flex-col items-center group w-full"
            >
              <div className="aspect-square w-full flex items-center justify-center">
                <img
                  src={
                    !marca.imagen_logo || marca.imagen_logo === "null"
                      ? "https://img.freepik.com/vector-gratis/ilustracion-icono-doodle-engranaje_53876-5596.jpg?semt=ais_hybrid&w=740"
                      : marca.imagen_logo
                  }
                  alt={`Logo de ${marca.nombre}`}
                  className="w-4/5 h-4/5 object-contain mx-auto transition-transform group-hover:scale-110"
                  draggable={false}
                />
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
