// /app/components/ui/VariationBox.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { Categoria, Variacion } from "@/app/types/valorVariacion";

// Interfaces 
interface VariationBoxProps {
  categoryLevel: number;
  categoryId: number;
  setSelectedVariations: React.Dispatch<React.SetStateAction<number[]>>; // Para pasar las variaciones seleccionadas al parent
}

const VariationBox: React.FC<VariationBoxProps> = ({ categoryLevel, 
                                                      categoryId,
                                                      setSelectedVariations })=>
{
  const [variations, setVariations] = useState<Variacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<number[]>([]);

  // Estado para controlar cuáles variaciones están "abiertas" (colapsadas) en el UI
  const [openVars, setOpenVars] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    async function fetchVariations() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/variacion/${categoryLevel}/${categoryId}`
        );
        if (!res.ok) {
          throw new Error("Error al cargar variaciones");
        }
        const data: Categoria[] = await res.json();
        // Si la API devuelve al menos un objeto, tomamos data[0].variaciones
        if (Array.isArray(data) && data.length > 0) {
          setVariations(data[0].variaciones);
          // Abrir todas las variaciones por defecto
          const openState = data[0].variaciones.reduce((acc, variation) => {
            acc[variation.id_variacion] = true;
            return acc;
          }, {} as { [key: number]: boolean });
          setOpenVars(openState);
        } else {
          setVariations([]);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar variaciones");
        setVariations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVariations();
  }, [categoryLevel, categoryId]);

  const toggle = (id: number) => {
    setOpenVars((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleValueSelect = (variationId: number, valueId: number) => {
    // 1. Obtenemos todos los valores de ESTA variación
    const currentVariationValues = variations
      .find(v => v.id_variacion === variationId)
      ?.valores.map(v => v.id_valor) || [];

    // 2. Verificamos si el valor ya está seleccionado
    const isCurrentlySelected = selectedValues.includes(valueId);

    // 3. Filtramos cualquier valor de esta variación
    const filtered = selectedValues.filter(id => !currentVariationValues.includes(id));

    // 4. Si estaba seleccionado, lo quitamos (deselección), sino lo añadimos
    const newSelection = isCurrentlySelected ? filtered : [...filtered, valueId];

    setSelectedValues(newSelection);
    setSelectedVariations(newSelection);
  };

  // ● Mientras carga, mostramos un skeleton loader
  if (loading) {
    return (
      <div className="w-full h-full bg-white">
        <div className="animate-pulse p-4">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ● Si hubo error de fetch, mostramos el mensaje con mejor UI
  if (error) {
    return (
      <div className="w-full h-full bg-white">
        <div className="text-center py-8 px-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error al cargar filtros</p>
          <p className="text-gray-500 text-sm">No se pudieron cargar las opciones de filtrado</p>
        </div>
      </div>
    );
  }

  // ● Si no hay variaciones (array vacío), mostramos mensaje personalizado
  if (variations.length === 0) {
    return (
      <div className="w-full h-full bg-white">
        <div className="text-center py-8 px-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-2">Sin filtros disponibles</p>
          <p className="text-gray-500 text-sm">No hay variaciones para esta categoría</p>
        </div>
      </div>
    );
  }

  // ● Si hay variaciones, las presentamos sin header "Filtros"
  return (
    <div className="w-full h-full bg-white">
      {/* Lista de variaciones */}
      <div className="px-4  space-y-3">
        {variations.map((vario) => (
          <div key={vario.id_variacion} className="border-b border-gray-200 last:border-b-0">
            {/* Título colapsable */}
            <button
              onClick={() => toggle(vario.id_variacion)}
              className="flex justify-between items-center w-full text-left py-3 px-2 hover:bg-gray-50 transition-colors duration-200"
            >
              <span className="font-medium text-gray-800">{vario.nombre_variacion}</span>
              {openVars[vario.id_variacion] ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Lista de valores con checkboxes, solo si está "abierto" */}
            {openVars[vario.id_variacion] && (
              <div className="px-2 pb-3">
                <div className="space-y-2">
                  {vario.valores.map((val) => {
                    const isSelected = selectedValues.includes(val.id_valor);
                    return (
                      <label
                        key={val.id_valor}
                        className="flex items-center cursor-pointer group py-1"
                      >
                        <input
                          type="radio"
                          name={`variation-${vario.id_variacion}`}
                          checked={isSelected}
                          onChange={() => handleValueSelect(vario.id_variacion, val.id_valor)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className={`ml-3 text-sm transition-colors duration-200 ${
                          isSelected 
                            ? 'text-blue-700 font-medium' 
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {val.nombre_valor}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariationBox;