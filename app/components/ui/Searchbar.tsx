"use client";
import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxButton,
} from "@headlessui/react";
import { Search } from "lucide-react";
import type { Producto } from "@/app/types/producto";
import { sendGAEvent } from "@next/third-parties/google";

const Searchbar = () => {
  const [productos, setProductos] = useState<Producto[]>([]); // Para almacenar los productos obtenidos de la API
  const [isLoading, setIsLoading] = useState(true); // Para manejar el estado de carga

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/productos");
        const data = await res.json();
        // Asegura que productos siempre sea un array
        if (Array.isArray(data)) {
          setProductos(data);
        } else if (Array.isArray(data.products)) {
          setProductos(data.products);
        } else {
          setProductos([]);
        }
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setProductos([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // Manejar selección de producto con navegación
  const handleSelectedProduct = (producto: Producto | null) => {
    if (producto) {
      setSelectedProduct(producto);
      setBusqueda("");
      sendGAEvent("event", "search", { search_term: busqueda });
      // Redirigir al producto seleccionado
      window.location.href = `/productos/${producto.id_producto_especifico}`;
    }
  };

  // Filtrar los productos según la búsqueda
  const filteredProductos = useMemo(
    () =>
      busqueda === ""
        ? productos
        : productos.filter((producto) =>
            producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
          ),
    [productos, busqueda]
  );

  return (
    <div className="w-full relative">
      {/* Checar el onChange, puede llegar a dar errores en el futuro*/}
      <Combobox<Producto | null>
        value={selectedProduct}
        onChange={handleSelectedProduct}
        onClose={() => setBusqueda("")}
      >
        <div className="relative">
          <ComboboxInput
            className="w-full bg-white h-11 pl-4 pr-12 border rounded-lg outline-none text-ebony-950 focus:shadow-lg focus:border-ebony-950 transition-all duration-200"
            placeholder="¿Qué estás buscando?"
            value={busqueda}
            onChange={(event) => {
              setBusqueda(event.target.value);
            }}
            displayValue={
              (producto: Producto | null) => (producto ? "" : busqueda) // Mantener texto de búsqueda visible
            }
          />
          <ComboboxButton
            aria-label="Buscar productos"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 hover:scale-110 transition-transform cursor-pointer"
          >
            <Search className="text-ebony-950" size={30} />
          </ComboboxButton>

          <ComboboxOptions className="flex flex-col absolute z-10 w-full bg-white rounded-lg shadow-lg max-h-90 p-5 gap-2 top-full mt-2 overflow-hidden ">
            {isLoading ? (
              /* Cuando esté cargando */
              <div className="p-6 text-center">
                <div className="animate-pulse">
                  <div className="h-2 bg-ebony-200 rounded w-1/3 mx-auto mb-2"></div>
                  <div className="h-2 bg-ebony-200 rounded w-1/2 mx-auto"></div>
                </div>
                <p className="text-ebony-600 text-sm mt-3">
                  Cargando productos...
                </p>
              </div>
            ) : busqueda === "" ? (
              /* Cuando no se haya ingresado nada */
              <div className="p-6 text-center">
                <p className="text-ebony-500 text-sm ">
                  Comienza a escribir para buscar productos
                </p>
              </div>
            ) : filteredProductos.length > 0 ? (
              /* Cuando hay productos que coinciden con la búsqueda */
              <div className="p-4">
                <p className="text-ebony-900 text-sm font-bold mb-4 px-2">
                  Productos para &quot;{busqueda}&quot; ({filteredProductos.length})
                </p>
                <div>
                  {filteredProductos.slice(0, 3).map((producto) => (
                    <ComboboxOption
                      key={producto.producto_id}
                      value={producto}
                      className={({ active }) =>
                        `flex rounded-lg cursor-pointer items-center gap-4 px-3 py-3 transition-colors duration-200 ${active ? "bg-ebony-100" : ""}`
                      }
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={producto.imagen_producto}
                          alt={`imagen de ${producto.nombre}`}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span>{producto.nombre}</span>
                      </div>
                    </ComboboxOption>
                  ))}
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    className="w-full text-center text-ebony-600 hover:text-ebony-800 text-sm font-medium py-2 hover:bg-ebony-25 cursor-pointer rounded-lg transition-colors"
                    onClick={() => {}}
                  >
                    Ver todos los resultados para &quot;{busqueda}&quot;
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mb-3">
                  <div className="w-12 h-12 mx-auto bg-ebony-100 rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5 text-ebony-400" />
                  </div>
                </div>
                <p className="text-ebony-800 text-sm font-medium mb-2">
                  No se encontraron productos
                </p>
                <p className="text-ebony-500 text-xs">
                  Intenta con otro término de búsqueda
                </p>
              </div>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
};

export default Searchbar;
