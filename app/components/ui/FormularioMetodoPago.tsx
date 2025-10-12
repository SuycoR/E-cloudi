// components/ui/FormularioMetodoPago.tsx
"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { SaveTarjetaParams } from "@/app/utils/tarjetaActions";

interface TipoPagoRow {
  id: number;
  valor: string;
}

interface FormularioProps {
  tarjeta: SaveTarjetaParams;
  onSave: (tarjeta: SaveTarjetaParams) => void;
  onClose: () => void;
}

export default function FormularioMetodoPago({
  tarjeta,
  onSave,
  onClose,
}: FormularioProps) {
  const [form, setForm] = useState<SaveTarjetaParams>({ ...tarjeta });
  const [tipos, setTipos] = useState<TipoPagoRow[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Obtener lista de tipos de pago
    fetch("/api/tipo-pago")
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando tipos");
        return res.json();
      })
      .then((data: TipoPagoRow[]) => setTipos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTipos(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (name === "tipoPagoId") {
      newValue = Number(value);
    } else {
      newValue = value;
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">
          {form.id ? "Editar Método" : "Nuevo Método"}
        </h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="tipoPagoId"
          >
            Tipo de Pago
          </label>
          {loadingTipos ? (
            <p>Cargando tipos…</p>
          ) : (
            <select
              name="tipoPagoId"
              id="tipoPagoId"
              value={form.tipoPagoId}
              onChange={handleChange}
              className="w-full border-gray-300 rounded p-2"
              required
            >
              <option value={0} disabled>
                Seleccionar…
              </option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.valor}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="proveedor">
            Proveedor
          </label>
          <input
            type="text"
            name="proveedor"
            id="proveedor"
            value={form.proveedor}
            onChange={handleChange}
            className="w-full border-gray-300 rounded p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="numeroCuenta"
          >
            Número de Cuenta
          </label>
          <input
            type="text"
            name="numeroCuenta"
            id="numeroCuenta"
            value={form.numeroCuenta}
            onChange={handleChange}
            placeholder="Solo últimos 4 dígitos"
            className="w-full border-gray-300 rounded p-2"
            required
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="fechaVencimiento"
            >
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              name="fechaVencimiento"
              id="fechaVencimiento"
              value={form.fechaVencimiento}
              onChange={handleChange}
              className="w-full border-gray-300 rounded p-2"
              required
            />
          </div>
          {/* <div className="flex items-end">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isPrimary"
                checked={form.isPrimary}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Predeterminado</span>
            </label>
          </div>*/}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
