'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ProductoGeneral {
  nombre: string;
  descripcion: string;
  imagen_producto: string;
  marca: string;
}

interface ProductoEspecifico {
  id_especifico: number;
  SKU: string;
  cantidad_stock: number;
  imagen_producto: string;
  precio: number;
}

export default function UpdateProductPage() {
  const { id } = useParams();
  const [productoGeneral, setProductoGeneral] = useState<ProductoGeneral | null>(null);
  const [productosEspecificos, setProductosEspecificos] = useState<ProductoEspecifico[]>([]);

  useEffect(() => {
    const fetchProducto = async () => {
      const res = await fetch(`/api/admin/productos/${id}`);
      const data = await res.json();

      setProductoGeneral({
        nombre: data.productoGeneral.nombre,
        descripcion: data.productoGeneral.descripcion,
        imagen_producto: data.productoGeneral.imagen_producto,
        marca: data.productoGeneral.marca,
      });

      const especificos = data.productosEspecificos.map((item: {
        id_especifico: number;
        SKU: string;
        stock: number;
        imagen: string;
        precio: number;
      }) => ({
        id_especifico: item.id_especifico,
        SKU: item.SKU,
        cantidad_stock: item.stock,
        imagen_producto: item.imagen,
        precio: item.precio,
      }));

      setProductosEspecificos(especificos);
    };

    fetchProducto();
  }, [id]);

  const handleGuardarCambios = async () => {
    if (!productoGeneral) return;

    try {
      const res = await fetch(`/api/admin/productos/${id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productoGeneral,
          productosEspecificos
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Producto actualizado correctamente ✅");
      } else {
        alert("Error al actualizar ❌: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectarse con el servidor");
    }
  };

  const handleDisableProduct = async (id_especifico: number) => {
    try {
      const res = await fetch(`/api/admin/productos/${id_especifico}/disable`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        alert("Producto deshabilitado correctamente ✅");
        // Actualizamos el estado para reflejar el cambio
        const nuevosProductos = productosEspecificos.map(p => 
          p.id_especifico === id_especifico ? { ...p, estado: 'deshabilitado' } : p
        );
        setProductosEspecificos(nuevosProductos);
      } else {
        alert("Error al deshabilitar el producto ❌: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectarse con el servidor");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Producto #{id}</h1>

      {productoGeneral && (
        <div className="space-y-4">
          <input
            type="text"
            value={productoGeneral.nombre}
            onChange={(e) => setProductoGeneral({ ...productoGeneral, nombre: e.target.value })}
            className="w-full border px-4 py-2 rounded"
            placeholder="Nombre del producto"
          />
          <textarea
            value={productoGeneral.descripcion}
            onChange={(e) => setProductoGeneral({ ...productoGeneral, descripcion: e.target.value })}
            className="w-full border px-4 py-2 rounded"
            placeholder="Descripción"
          />
          <input
            type="url"
            value={productoGeneral.imagen_producto || ""}
            onChange={(e) => setProductoGeneral({ ...productoGeneral, imagen_producto: e.target.value })}
            className="w-full border px-4 py-2 rounded"
            placeholder="Imagen (URL)"
          />
          <input
            type="text"
            value={productoGeneral.marca}
            disabled
            className="w-full border px-4 py-2 rounded bg-gray-100"
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mt-8">Productos Específicos</h2>

      {productosEspecificos.map((p, i) => (
        <div key={i} className="border p-4 mt-4 rounded space-y-2">
          <input
            type="text"
            value={p.SKU}
            onChange={(e) => {
              const nuevos = [...productosEspecificos];
              nuevos[i].SKU = e.target.value;
              setProductosEspecificos(nuevos);
            }}
            className="w-full border px-3 py-2 rounded"
            placeholder="SKU"
          />
          <input
            type="number"
            value={p.cantidad_stock}
            onChange={(e) => {
              const nuevos = [...productosEspecificos];
              nuevos[i].cantidad_stock = parseInt(e.target.value);
              setProductosEspecificos(nuevos);
            }}
            className="w-full border px-3 py-2 rounded"
            placeholder="Stock"
          />
          <input
            type="url"
            value={p.imagen_producto || ""}
            onChange={(e) => {
              const nuevos = [...productosEspecificos];
              nuevos[i].imagen_producto = e.target.value;
              setProductosEspecificos(nuevos);
            }}
            className="w-full border px-3 py-2 rounded"
            placeholder="Imagen (URL)"
          />
          <input
            type="number"
            value={p.precio}
            onChange={(e) => {
              const nuevos = [...productosEspecificos];
              nuevos[i].precio = parseFloat(e.target.value);
              setProductosEspecificos(nuevos);
            }}
            className="w-full border px-3 py-2 rounded"
            placeholder="Precio"
          />
          
          <div className="text-right">
            <button
              onClick={() => handleDisableProduct(p.id_especifico)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mt-4"
            >
              Deshabilitar
            </button>
          </div>
        </div>
      ))}
      
      <div className="text-right mt-8">
        <button
          onClick={handleGuardarCambios}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
