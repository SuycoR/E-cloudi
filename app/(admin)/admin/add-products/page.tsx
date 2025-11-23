
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CategoriaNivel1 } from '@/app/types/categoria';
import { useProduct } from '@/app/context/ProductContext';

interface Marca {
  id: number;
  nombre: string;
}

export default function AddProductPage() {
  const router = useRouter();

  const [categorias, setCategorias] = useState<CategoriaNivel1[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  const { productoGeneral, setProductoGeneral } = useProduct();

  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then((data: CategoriaNivel1[]) => setCategorias(data))
      .catch(() => setCategorias([]));

    fetch('/api/marcas')
      .then(res => res.json())
      .then((data: Marca[]) => setMarcas(data))
      .catch(() => setMarcas([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setProductoGeneral(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'categoria1' && { categoria2: '', categoria3: '' }),
      ...(name === 'categoria2' && { categoria3: '' }),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Producto general:', productoGeneral);
    alert('Datos del producto guardados en contexto.');
  };

  const handleNext = () => {
    console.log('Datos a pasar (guardados en contexto):', productoGeneral);
    router.push('/admin/add-products/variantes');
  };

  const selectedCat1 = categorias.find(c => c.id.toString() === productoGeneral.categoria1);
  const selectedCat2 = selectedCat1?.subcategorias?.find(
    s => s.id.toString() === productoGeneral.categoria2
  );
  const hasSub2 = selectedCat1?.subcategorias || [];
  const hasSub3 = selectedCat2?.subcategorias || [];

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900">Producto</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block mb-2 font-semibold text-gray-700">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={productoGeneral.nombre}
            onChange={handleChange}
            placeholder="Ej. Teclado mecánico RGB"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block mb-2 font-semibold text-gray-700">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={productoGeneral.descripcion}
            onChange={handleChange}
            placeholder="Descripción detallada del producto"
            className="w-full rounded-md border border-gray-300 px-4 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            required
          />
        </div>

        {/* Imagen URL */}
        <div>
          <label htmlFor="imagen_producto" className="block mb-2 font-semibold text-gray-700">
            Imagen (URL)
          </label>
          <input
            id="imagen_producto"
            type="url"
            name="imagen_producto"
            value={productoGeneral.imagen_producto}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Marca */}
        <div>
          <label htmlFor="marca" className="block mb-2 font-semibold text-gray-700">
            Marca
          </label>
          <select
            id="marca"
            name="marca"
            value={productoGeneral.marca || ''}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona una marca</option>
            {marcas.map(marca => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría 1 */}
        <div>
          <label htmlFor="categoria1" className="block mb-2 font-semibold text-gray-700">
            Categoría
          </label>
          <select
            id="categoria1"
            name="categoria1"
            value={productoGeneral.categoria1}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría 2 */}
        {hasSub2.length > 0 && (
          <div>
            <label htmlFor="categoria2" className="block mb-2 font-semibold text-gray-700">
              Subcategoría
            </label>
            <select
              id="categoria2"
              name="categoria2"
              value={productoGeneral.categoria2}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona una subcategoría</option>
              {hasSub2.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Categoría 3 */}
        {hasSub3.length > 0 && (
          <div>
            <label htmlFor="categoria3" className="block mb-2 font-semibold text-gray-700">
              Sub-subcategoría
            </label>
            <select
              id="categoria3"
              name="categoria3"
              value={productoGeneral.categoria3}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona una opción</option>
              {hasSub3.map(op => (
                <option key={op.id} value={op.id}>
                  {op.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botón Siguiente */}
        <button
          type="button"
          onClick={handleNext}
          className="w-full mt-8 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Siguiente
        </button>
      </form>
    </div>
  );
}
