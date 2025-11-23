// app/metodo-pago/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CreditCard } from "lucide-react";
import {
  getTarjetas,
  saveTarjeta,
  deleteTarjeta,
  SaveTarjetaParams,
} from "@/app/utils/tarjetaActions";
import FormularioMetodoPago from "@/app/components/ui/FormularioMetodoPago";
import { MetodoPagoRow } from "@/app/types/metodoPago";

export default function MisMetodosPagoPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined;

  const [tarjetas, setTarjetas] = useState<MetodoPagoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarjeta, setEditTarjeta] = useState<SaveTarjetaParams | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getTarjetas(userId)
      .then((data) => setTarjetas(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <div>Cargando métodos de pago...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const formatCard = (t: MetodoPagoRow) =>
    `${t.tipo || "Tarjeta"} •••• ${t.numero_cuenta.slice(
      -4
    )} – ${t.fecha_vencimiento.slice(5, 7)}/${t.fecha_vencimiento
      .slice(0, 4)
      .slice(-2)}`;

  const handleAdd = () => {
    if (!userId) return;
    setEditTarjeta({
      userId,
      tipoPagoId: 0,
      proveedor: "",
      numeroCuenta: "",
      fechaVencimiento: new Date().toISOString().slice(0, 10),
      isPrimary: false,
    });
    setIsModalOpen(true);
  };


  const handleEdit = (t: MetodoPagoRow) => {
    setEditTarjeta({
      id: t.id,
      userId: t.id_usuario,
      tipoPagoId: t.id_tipo_pago,
      proveedor: t.proveedor,
      numeroCuenta: t.numero_cuenta,
      fechaVencimiento: t.fecha_vencimiento,
      isPrimary: t.es_predeterminado === 1,
    });
    setIsModalOpen(true);
  };

  // Función para manejar el cambio de método de pago principal
  const handleSetPrimary = async (metodo: MetodoPagoRow) => {
    if (!userId || !metodo.id) return;

    try {
      const response = await fetch("/api/metodo-pago/set-default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: userId,
          metodo_pago_id: metodo.id,
        }),
      });

      if (response.ok) {
        // Actualizar los métodos de pago después de establecer como principal
        setLoading(true);
        getTarjetas(userId)
          .then((data) => setTarjetas(data))
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      } else {
        const text = await response.text();
        console.error(
          "Error al establecer método de pago principal",
          response.status,
          text
        );
        alert(`Error ${response.status}: ${text}`);
      }
    } catch (error: unknown) {
      console.error("Error en la solicitud:", error);
      alert(
        "Error al establecer el método de pago como principal: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };



  const onSave = async (tarjeta: SaveTarjetaParams) => {
    try {
      const saved = await saveTarjeta(tarjeta);
      setTarjetas((prev) => {
        // Si este método se guarda como predeterminado, desmarcar todos los demás primero
        if (saved.es_predeterminado === 1) {
          const cleared: MetodoPagoRow[] = prev.map(
            (t) => ({ ...t, es_predeterminado: 0 } as MetodoPagoRow)
          );
          const idx = cleared.findIndex((t) => t.id === saved.id);
          if (idx !== -1) {
            cleared[idx] = saved;
            return cleared;
          }
          return [saved, ...cleared];
        }
        // Si no es predeterminado, actualizar o agregar normalmente
        if (tarjeta.id) {
          return prev.map((t) => (t.id === saved.id ? saved : t));
        }
        return [saved, ...prev];
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este método de pago?")) return;
    const result = await deleteTarjeta(id);
    if (result.ok) {
      setTarjetas((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert(result.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditTarjeta(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <CreditCard className="text-ebony-800" size={28} />
        Mis métodos de pago
      </h1>

      <div className="space-y-6">
        {tarjetas.length > 0 ? (
          tarjetas.map((t) => (
            <div
              key={t.id}
              className={
                `rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow duration-200 ` +
                (t.es_predeterminado === 1
                  ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                  : 'bg-white border-gray-200')
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="radio"
                      name="metodo_principal"
                      checked={t.es_predeterminado === 1}
                      onChange={() => handleSetPrimary(t)}
                      className="w-4 h-4 text-gray-700 focus:ring-gray-500 border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      {t.es_predeterminado === 1
                        ? "Método principal"
                        : "Establecer como principal"}
                    </label>
                  </div>

                  <p className={`font-medium mb-1 ${t.es_predeterminado === 1 ? 'text-blue-800' : 'text-gray-800'}`}>
                    {formatCard(t)}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleEdit(t)}
                    className="bg-ebony-800 text-white px-4 py-2 rounded-md hover:bg-ebony-900 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No tienes métodos de pago registrados.</p>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleAdd}
          className="bg-ebony-900 text-white px-6 py-2 rounded-md hover:bg-ebony-800 cursor-pointer transition-colors"
        >
          Añadir nuevo método
        </button>
      </div>

      {/* Modal de añadir/editar método de pago */}
      {isModalOpen && editTarjeta && (
        <FormularioMetodoPago
          tarjeta={editTarjeta}
          onClose={handleCloseModal}
          onSave={onSave}
        />
      )}
    </div>
  );
}