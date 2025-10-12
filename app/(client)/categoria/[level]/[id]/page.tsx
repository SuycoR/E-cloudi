// /app/categoria/[categoryLevel]/[categoryId]/page.tsx
'use client';

import React, { useState } from "react";
import VariationBox from "@/app/components/ui/VariationBox";
import ProductSection from "@/app/components/products/ProductSection";
import { categorias } from "@/lib/categorias";
import CategoryGrid from "@/app/components/ui/CategoriaGrid";
import PriceRange from "@/app/components/products/ProductFilterPrice";
import { 
  Home, 
  ChevronRight, 
  Filter, 
  DollarSign, 
  Grid3X3, 
  Package, 
  Tag
} from "lucide-react";

// Función que trae el nombre de los id's, permite hacer esto: "Inicio/perifericos/monitor"
function getBreadcrumb(level: number, id: number): string[] {
  const path: string[] = ["Inicio"];

  for (const cat1 of categorias) {
    if (level === 1 && cat1.id === id) {
      path.push(cat1.nombre);
      break;
    }
    for (const cat2 of cat1.subcategorias) {
      if (level === 2 && cat2.id === id) {
        path.push(cat1.nombre, cat2.nombre);
        break;
      }
      for (const cat3 of cat2.subsubcategorias ?? []) {
        if (level === 3 && cat3.id === id) {
          path.push(cat1.nombre, cat2.nombre, cat3.nombre);
          break;
        }
      }
    }
  }

  return path;
}

export default function CategoriaPage({ params }: { params: { level: string; id: string } }) {
  const categoryLevel = Number(params.level);
  const categoryId = Number(params.id);
  const [selectedVariations, setSelectedVariations] = useState<number[]>([]);
  const [minPrecio, setMinPrecio] = useState<string | null>(null);
  const [maxPrecio, setMaxPrecio] = useState<string | null>(null);
  const [hasInitializedRange, setHasInitializedRange] = useState(false);
  const [initialMin, setInitialMin] = useState<number | null>(null);
  const [initialMax, setInitialMax] = useState<number | null>(null);


  // Para cambiar dinámicamente el filtro de ProductSection
  const filterType = selectedVariations.length > 0 ? "byVariacion" : "byCategory";
  // Usa una key única para forzar el remount de ProductSection
  const productSectionKey = `${categoryId}-${categoryLevel}-${selectedVariations.join(',')}`;
  // Breadcrumb
  const breadcrumb = getBreadcrumb(categoryLevel, categoryId);
  
  console.log("Precio minimo:", minPrecio);
  console.log("Precio maximo:", maxPrecio);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header con breadcrumb mejorado */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-padding py-6">
          <nav className="flex items-center justify-center">
            <div className="flex items-center space-x-3 text-sm">
              {breadcrumb.map((item, i) => (
                <div key={i} className="flex items-center">
                  {i > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                  <div className={`
                    transition-all duration-300 px-4 py-2 rounded-lg flex items-center gap-2
                    ${i === breadcrumb.length - 1 
                      ? "bg-gradient-to-r from-ebony-700 to-ebony-800 text-white font-semibold shadow-lg transform hover:scale-105" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md"
                    }
                  `}>
                    {i === 0 && <Home className="w-4 h-4" />}
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Sidebar, subcategorías y productos en el mismo container-padding */}
      <div className="container-padding py-8">
        <div className="flex gap-8">
          {/* Sidebar izquierdo - Filtros */}
          <div className="w-80 shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* Filtros de variación */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-ebony-700 to-ebony-800 px-6 py-5">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Filter className="w-5 h-5 text-ebony-300 mr-3" />
                    Filtros
                  </h3>
                </div>
                <div className="p-6">
                  <VariationBox
                    categoryLevel={categoryLevel}
                    categoryId={categoryId}
                    setSelectedVariations={setSelectedVariations}
                  />
                </div>
              </div>

              {/* Filtro de precio mejorado */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-ebony-700 to-ebony-800 px-6 py-5">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <DollarSign className="w-5 h-5 text-emerald-300 mr-3" />
                    Rango de Precio
                  </h3>
                </div>
                <div className="p-6 bg-gradient-to-b from-ebony-50/80 to-white">
                  <div className="space-y-4">
                    {/* Indicadores de precio actual */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-ebony-700 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-ebony-800">Precio Actual</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="px-3 py-1 bg-ebony-100 text-ebony-800 rounded-full font-semibold">
                          ${minPrecio || '0'}
                        </span>
                        <span className="text-ebony-400">-</span>
                        <span className="px-3 py-1 bg-ebony-100 text-ebony-800 rounded-full font-semibold">
                          ${maxPrecio || '0'}
                        </span>
                      </div>
                    </div>
                    {/* Componente de rango */}
                    <div className="bg-ebony-50 rounded-xl p-4 border border-ebony-200 shadow-sm">
                      <PriceRange
                        min={Number(initialMin ?? 0)}
                        max={Number(initialMax ?? 0)}
                        onChange={(nuevoMin, nuevoMax) => {
                          console.log("Nuevo rango elegido:", nuevoMin, nuevoMax);
                          console.log("precio minimo original:", minPrecio);
                          console.log("precio maximo original:", maxPrecio);
                          setMinPrecio(nuevoMin.toString());
                          setMaxPrecio(nuevoMax.toString());
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal: subcategorías y productos */}
          <div className="flex-1 space-y-8">
            {/* Subcategorías */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-ebony-700 to-ebony-800 px-6 py-5">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Grid3X3 className="w-6 h-6 text-blue-200 mr-3" />
                  Subcategorías
                </h2>
              </div>
              <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                <CategoryGrid level={categoryLevel} id={categoryId} />
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-ebony-700 to-ebony-800 px-6 py-5">
                <h2 className="text-xl font-bold text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 text-purple-200 mr-3" />
                    Productos en esta categoría
                  </div>
                  {selectedVariations.length > 0 && (
                    <div className="flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      <Tag className="w-4 h-4 mr-2" />
                      {selectedVariations.length} filtro{selectedVariations.length > 1 ? 's' : ''} aplicado{selectedVariations.length > 1 ? 's' : ''}
                    </div>
                  )}
                </h2>
              </div>
              <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                <ProductSection
                  title=""
                  key={productSectionKey}
                  MinPrecioEnvia={minPrecio}
                  MaxPrecioEnvia={maxPrecio}
                  filterType={filterType}
                  categoryLevel={categoryLevel}
                  categoryId={categoryId}
                  limit={20}
                  itemsPage={4}
                  asCarousel={false}
                  selectedVariations={selectedVariations}
                  onPrecioChange={(minPrecio, maxPrecio) => {
                    if (!hasInitializedRange) {
                      console.log("Callback en page:", minPrecio, maxPrecio);
                      setMinPrecio(minPrecio);
                      setMaxPrecio(maxPrecio);
                      setInitialMin(Number(minPrecio));
                      setInitialMax(Number(maxPrecio));
                      setHasInitializedRange(true);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categorías hijas */}
        <CategoryGrid level={categoryLevel} id={categoryId} />
        {/* Productos */}
        <ProductSection
          title="Productos en esta categoría"
          key={productSectionKey}
          MinPrecioEnvia={minPrecio}
          MaxPrecioEnvia={maxPrecio}
          filterType={filterType}
          categoryLevel={categoryLevel}
          categoryId={categoryId}
          limit={20}
          asCarousel={false}
          selectedVariations={selectedVariations} // Pasamos las variaciones seleccionadas
          onPrecioChange={(minPrecio, maxPrecio) => {
            if (!hasInitializedRange && selectedVariations.length === 0) {
              console.log("Callback en page:", minPrecio, maxPrecio);
              setMinPrecio(minPrecio);
              setMaxPrecio(maxPrecio);
              setInitialMin(Number(minPrecio));
              setInitialMax(Number(maxPrecio));
              // Marca que ya se inicializó el rango y no se volvera a inicializar por cada llamada
              setHasInitializedRange(true);
            }
          }}
        />

      </div>
    </div>
  );
}