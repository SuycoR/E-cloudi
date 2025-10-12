'use client';

import { useEffect, useState, useRef } from 'react';
import { Producto } from '@/app/types/producto';

export default function CarruselGaleria() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch('/api/productos');
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    if (productos.length === 0) return;

    intervaloRef.current = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % productos.length);
    }, 4000);

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [productos]);

const siguiente = () => {
  setIndiceActual((prev) => (prev + 1) % productos.length);
};

const anterior = () => {
  setIndiceActual((prev) => (prev - 1 + productos.length) % productos.length);
};


  if (productos.length === 0) {
    return <p className="text-center text-gray-500 mt-10">Cargando productos...</p>;
  }

  const producto = productos[indiceActual];

  return (
    <div className="relative w-[90vw] h-[70vh] max-w-4xl max-h-[90vh] mx-auto mt-10 select-none font-rubik">
      {/* Contenedor de imagen con 90% ancho y alto relativo al contenedor */}
      <div className="w-full h-full rounded-xl shadow-lg overflow-hidden bg-ebony-50 flex items-center justify-center">
        <img
          src={producto.imagen_producto}
          alt={producto.nombre}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Botones a los costados */}
      <button
        onClick={anterior}
        aria-label="Anterior"
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-ebony-200 bg-opacity-50 hover:bg-opacity-80 text-ebony-900 rounded-full p-2 shadow-md transition"
      >
        ‹
      </button>
      <button
        onClick={siguiente}
        aria-label="Siguiente"
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-ebony-200 bg-opacity-50 hover:bg-opacity-80 text-ebony-900 rounded-full p-2 shadow-md transition"
      >
        ›
      </button>

      {/* Texto descriptivo abajo */}
      <div className="mt-4 text-center">
        <h2 className="text-3xl font-semibold text-ebony-900">{producto.nombre}</h2>
        <p className="mt-2 text-ebony-700 max-w-xl mx-auto">{producto.descripcion}</p>
      </div>
    </div>
  );
}
