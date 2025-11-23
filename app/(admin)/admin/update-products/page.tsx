'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface Producto {
  producto_id: number;
  nombre: string;
}

export default function UpdateProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtrados, setFiltrados] = useState<Producto[]>([]);
  const router = useRouter();


  useEffect(() => {
    // Aquí deberías hacer fetch a tu API real
    fetch('/api/productos')
      .then(res => res.json())
      .then((data: Producto[]) => {
        setProductos(data);
        setFiltrados(data);
      });
  }, []);

  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltrados(productos);
      return;
    }

    const lower = busqueda.toLowerCase();
    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(lower) || p.producto_id.toString() === busqueda
    );
    setFiltrados(filtrados);
  }, [busqueda, productos]);

  const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };

  const handleEditar = (id: number) => {
    router.push(`/admin/update-products/${id}`);
    // Aquí puedes redirigir o mostrar un formulario de edición
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Actualizar productos</h1>

      <input
        type="text"
        placeholder="Buscar por ID o nombre..."
        value={busqueda}
        onChange={handleBuscar}
        className="mb-4 border px-4 py-2 w-full max-w-md rounded"
      />

      <div className="overflow-x-auto max-h-[500px] border rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(producto => (
              <tr key={producto.producto_id} className="border-t">
                <td className="px-4 py-2">{producto.producto_id}</td>
                <td className="px-4 py-2">{producto.nombre}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEditar(producto.producto_id)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    aria-label="Editar producto"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
