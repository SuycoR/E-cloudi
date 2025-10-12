"use client";

import React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import type { CategoriaNivel1 } from "@/app/types/categoria";
import type { DrawerProps } from "@/app/types/props";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";

const Drawer = ({ isOpen, onClose }: DrawerProps) => {
  const router = useRouter();
  // LLamada al api
  const [categoriasData, setCategoriasData] = useState<CategoriaNivel1[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/categorias")
        .then((res) => res.json())
        .then((data) => {
          setCategoriasData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error cargando categorías:", error);
          setLoading(false);
        });
    }
  }, [isOpen]);

  // Cerrar presionando la tecla escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Mostrar cargando
  const [loading, setLoading] = useState(false);

  // Activar el panel de subcategorías
  const [activeCat, setActiveCat] = useState<CategoriaNivel1 | null>(null);
  const [activeCat2, setActiveCat2] = useState<number | null>(null);

  // Cerrar el panel de subcategorías
  const handleCloseDrawer = () => {
    setActiveCat(null);
    onClose();
  };

  // Maneja el click en categorias nivel 2
  const toggleSubcategoria = (id: number) => {
    setActiveCat2(
      (prev) =>
        prev === id
          ? null
          : id
    );
  };

  // Estados para animar el panel de categorías
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  // Efecto para manejar la visibilidad y animación del panel
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  // Estado para animar el panel de subcategorías
  const [, setShowSubPanel] = useState(false);
  const [isSubPanelAnimating, setIsSubPanelAnimating] = useState(false);

  useEffect(() => {
    if (activeCat) {
      setShowSubPanel(true);
      setTimeout(() => setIsSubPanelAnimating(true), 10);
    } else {
      setIsSubPanelAnimating(false);
      setTimeout(() => setShowSubPanel(false), 300);
    }
  }, [activeCat]);

  // Función para volver al panel principal (solo en móvil)
  const handleBackToMain = () => {
    setActiveCat(null);
    setActiveCat2(null);
  };

  if (!isVisible) return null;

  return createPortal(
    <>
      {/* Backdrop mejorado con blur */}
      <div
        className="fixed h-full inset-0 flex bg-black/50 backdrop-blur-sm flex-1 z-60 transition-all duration-300"
        onClick={handleCloseDrawer}
      ></div>
      
      {/* Panel principal mejorado */}
      <aside
        className={`fixed h-full inset-0 flex bg-ebony-950 h-full w-80 sm:w-80 w-full text-white shadow-2xl flex flex-col z-70 transition-all duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header mejorado */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-wide">Categorías</h2>
            <button
              className="group hover:bg-white/10 p-2 rounded-full transition-all duration-200 hover:scale-105"
              onClick={handleCloseDrawer}
            >
              <X size={20} className="text-white/70 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner
                color_icon="text-white"
                color_bg="bg-transparent"
              />
            </div>
          ) : (
            <div className="p-4 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
              <ul className="space-y-2">
                {categoriasData.map((cat1) => (
                  <li key={cat1.id}>
                    <button
                      className="group flex items-center justify-between w-full text-left p-4 hover:bg-white/10 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-white/20 hover:shadow-lg hover:shadow-black/20"
                      onClick={() => setActiveCat(cat1)}
                    >
                      <span className="text-base font-medium text-white/90 group-hover:text-white transition-colors">
                        {cat1.nombre}
                      </span>
                      <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white transition-all duration-200 group-hover:translate-x-1" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sub categorías mejoradas */}
        {activeCat && (
          <div
            className={`absolute flex sm:left-80 left-0 inset-y-0 w-full bg-white z-80 shadow-2xl transform transition-all duration-300 ease-out ${
              isSubPanelAnimating
                ? "translate-x-0 opacity-100"
                : "sm:translate-x-0 translate-x-full opacity-0"
            }`}
          >
            <div className="w-full flex flex-col h-full">
              {/* Header del subpanel */}
              <div className="px-6 py-5 border-b border-black/10">
                <div className="flex items-center">
                  {/* Botón de volver solo en móvil */}
                  <button
                    className="sm:hidden group hover:bg-gray-100 p-2 rounded-full mr-3 transition-all duration-200"
                    onClick={handleBackToMain}
                  >
                    <ArrowLeft className="w-5 h-5 text-black group-hover:text-black transition-colors" />
                  </button>
                  
                  <div className="flex-1 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-black tracking-wide">
                      {activeCat.nombre}
                    </h2>
                    <a
                      className="text-sm font-medium text-black hover:text-black/70 hover:underline transition-colors px-3 py-1 rounded-lg hover:bg-black/5"
                      href=""
                    >
                      Ver todo
                    </a>
                  </div>
                </div>
              </div>

              {/* Contenido del subpanel */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-black/5">
                <ul className="space-y-2">
                  {activeCat.subcategorias?.map((cat2) => (
                    <li key={cat2.id} className="border-b border-black/5 last:border-b-0 pb-2 last:pb-0">
                      <button
                        className="group flex items-center justify-between w-full text-left p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-md"
                        onClick={() => {
                          if (cat2.subcategorias?.length) {
                            toggleSubcategoria(cat2.id);
                          } else {
                            router.push(`/categoria/2/${cat2.id}`);
                            onClose();
                          }
                        }}
                      >
                        <span className="text-base font-medium text-black group-hover:text-black transition-colors">
                          {cat2.nombre}
                        </span>
                        {cat2.subcategorias?.length ? (
                          activeCat2 === cat2.id ? (
                            <ChevronUp className="w-4 h-4 text-black/60 group-hover:text-black transition-all duration-200" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-black/60 group-hover:text-black transition-all duration-200" />
                          )
                        ) : null}
                      </button>
                      
                      {/* Sub categorías de nivel 3 mejoradas */}
                      {activeCat2 === cat2.id && cat2.subcategorias && (
                        <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                          <ul className="space-y-1">
                            {cat2.subcategorias.map((cat3) => (
                              <li key={cat3.id}>
                                <button className="group flex items-center justify-between w-full text-left text-sm p-2 hover:bg-white hover:shadow-sm rounded-md cursor-pointer transition-all duration-150 border border-transparent hover:border-gray-200"
                                  onClick={() => {
                                    router.push(`/categoria/3/${cat3.id}`);
                                    onClose();
                                  }}
                                >
                                  <span className="text-black group-hover:text-black font-medium transition-colors">
                                    {cat3.nombre}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-black/60 group-hover:text-black transition-all duration-150 group-hover:translate-x-0.5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                          <button
                            className="inline-block mt-3 text-xs font-semibold text-black hover:text-black/70 hover:underline transition-colors px-2 py-1 rounded hover:bg-white/50"
                            onClick={() =>{
                              router.push(`/categoria/2/${cat2.id}`);
                            }}
                          >
                            Ver todo en {cat2.nombre}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
};

export default Drawer;