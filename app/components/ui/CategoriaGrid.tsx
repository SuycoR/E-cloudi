"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Categoria = {
  id: number
  nombre_categoria: string
  imagen: string
}

type Props = {
  level: number
  id: number
}

export default function CategoriaGrid({ level, id }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/categorias/especifica/${level}/${id}`)
        const data = await res.json()
        setCategorias(data)
      } catch (error) {
        console.error("Error al cargar categorías", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategorias()
  }, [level, id])

  const handleClick = (categoriaId: number) => {
    router.push(`/categoria/${level + 1}/${categoriaId}`)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-40 mb-3"></div>
              <div className="bg-gray-200 rounded h-4 w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {categorias.length > 0 ? (
        <div
          className={`gap-6 ${
            categorias.length < 4
              ? "flex justify-center flex-wrap max-w-4xl mx-auto"
              : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          }`}
        >
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="group cursor-pointer text-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => handleClick(cat.id)}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-300 group-hover:shadow-md group-hover:border-gray-200">
                <div className="relative overflow-hidden rounded-lg bg-gray-50 h-32 flex items-center justify-center mb-3">
                  <img
                    src={cat.imagen || "/placeholder.png"}
                    alt={cat.nombre_categoria}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 group-hover:text-ebony-600 transition-colors duration-300">
                  {cat.nombre_categoria}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">No se encontraron subcategorías</p>
          <p className="text-gray-400 text-sm">Intenta navegar a una categoría diferente</p>
        </div>
      )}
    </div>
  )
}