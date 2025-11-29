"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";

interface Category {
  id: number;
  nombre_categoria: string;
  imagen: string;
}

interface CategoryCardsProps {
  title?: string;
  level?: number;
  parentId?: number;
}

// Colores de fondo para las tarjetas de categoría
const cardColors = [
  "bg-rose-50 hover:bg-rose-100",
  "bg-blue-50 hover:bg-blue-100",
  "bg-amber-50 hover:bg-amber-100",
  "bg-emerald-50 hover:bg-emerald-100",
  "bg-purple-50 hover:bg-purple-100",
  "bg-cyan-50 hover:bg-cyan-100",
  "bg-orange-50 hover:bg-orange-100",
  "bg-indigo-50 hover:bg-indigo-100",
];

export default function CategoryCards({
  title = "Compra por Categoría",
  level = 1,
  parentId = 0,
}: CategoryCardsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        // Fetch top-level categories
        const res = await fetch(
          `/api/categorias/especifica/${level}/${parentId}`
        );
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [level, parentId]);

  const handleClick = (categoryId: number) => {
    router.push(`/categoria/${level}/${categoryId}`);
  };

  if (isLoading) {
    return (
      <section className="py-8 sm:py-10">
        <div className="container-padding">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8">
            {title}
          </h2>
          <div className="flex justify-center">
            <LoadingSpinner
              color_icon="text-ebony-950"
              color_bg="bg-transparent"
            />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-8 sm:py-10" aria-labelledby="category-title">
      <div className="container-padding">
        {/* Section Title */}
        <h2
          id="category-title"
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8"
        >
          {title}
        </h2>

        {/* Category Grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
          role="list"
          aria-label="Lista de categorías de productos"
        >
          {categories.slice(0, 8).map((category, index) => (
            <article
              key={category.id}
              onClick={() => handleClick(category.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(category.id);
                }
              }}
              role="listitem"
              tabIndex={0}
              aria-label={`Categoría: ${category.nombre_categoria}. Presiona Enter para ver productos`}
              className={`group cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-300 
                         hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                           cardColors[index % cardColors.length]
                         }`}
            >
              {/* Image Container */}
              <div className="aspect-square flex items-center justify-center mb-3">
                <img
                  src={category.imagen || "/img/placeholder-category.png"}
                  alt={`Imagen de la categoría ${category.nombre_categoria}`}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/200?text=Categoría";
                  }}
                />
              </div>

              {/* Category Name */}
              <h3 className="text-center text-sm sm:text-base font-semibold text-gray-800 line-clamp-2">
                {category.nombre_categoria}
              </h3>
            </article>
          ))}
        </div>

        {/* Ver Todas Button */}
        {categories.length > 8 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => router.push("/categoria/1/0")}
              className="px-6 py-3 bg-ebony-800 text-white font-semibold rounded-full 
                       hover:bg-ebony-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ebony-600 focus:ring-offset-2"
              aria-label={`Ver todas las ${categories.length} categorías disponibles`}
            >
              Ver todas las categorías
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
