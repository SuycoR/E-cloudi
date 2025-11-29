"use client";
import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { useSession } from "next-auth/react";

interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Pedido {
  id: number;
  orden_total: number;
  estado: string;
  direccion: string;
  productos: Producto[];
}

export default function PedidosPage() {
  const { data: session } = useSession();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (session?.user?.id) {
      const fetchPedidos = async () => {
        try {
          const usuarioId = session.user?.id;
          if (!usuarioId) return;
          const res = await fetch(`/api/pedidos?usuario_id=${usuarioId}`);

          if (res.ok) {
            const data = await res.json();
            setPedidos(data);
          } else {
            console.error("Error al obtener los pedidos");
            setError("Error al obtener los pedidos.");
          }
        } catch (error) {
          console.error("Hubo un problema con la solicitud:", error);
          setError("Hubo un problema con la solicitud.");
        } finally {
          setLoading(false);
        }
      };

      fetchPedidos();
    }
  }, [session]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Package className="text-black-600" size={28} />
        Mis pedidos
      </h1>

      {pedidos.length > 0 ? (
        pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(pedido.id)}
            >
              <div>
                <p className="font-semibold text-gray-800">
                  Pedido #{pedido.id}
                </p>
                <p className="text-sm text-gray-600">Estado: {pedido.estado}</p>
                <p className="text-sm text-gray-600">
                  Dirección: {pedido.direccion}
                </p>
                <p className="text-sm text-gray-600">
                  Total: S/ {pedido.orden_total.toFixed(2)}
                </p>
              </div>
              <span className="text-blue-600 text-sm">
                {expanded === pedido.id ? "Ocultar" : "Ver más"}
              </span>
            </div>

            {expanded === pedido.id && (
              <div className="mt-4 space-y-3">
                {pedido.productos.map((producto, idx) => (
                  <div
                    key={idx}
                    className="bg-white border rounded-md p-3 shadow-sm"
                  >
                    <p className="font-medium text-gray-700">
                      {producto.nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {producto.cantidad}
                    </p>
                    <p className="text-sm text-gray-600">
                      Precio total: S/{" "}
                      {(producto.cantidad * producto.precio).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No tienes pedidos disponibles.</p>
      )}
    </div>
  );
}
