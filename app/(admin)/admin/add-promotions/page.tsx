// app/add-promotions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePromotion, PromotionDraft } from '@/app/context/PromotionContext';

export default function PromotionForm() {
  const router = useRouter();
  const { promotionDraft, setPromotionDraft } = usePromotion();

  // Local form state initializes from context draft
  const [form, setForm] = useState<PromotionDraft>(promotionDraft);
  const [errorFecha, setErrorFecha] = useState<string>('');

  useEffect(() => {
    setForm(promotionDraft);
  }, [promotionDraft]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'fecha_inicio' || name === 'fecha_fin') {
      const updated = { ...form, [name]: value };
      if (updated.fecha_inicio && updated.fecha_fin) {
        const start = new Date(updated.fecha_inicio).getTime();
        const end = new Date(updated.fecha_fin).getTime();
        setErrorFecha(start >= end ? 'La fecha de inicio debe ser anterior a la fecha de fin' : '');
      } else {
        setErrorFecha('');
      }
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation final
    const start = new Date(form.fecha_inicio).getTime();
    const end = new Date(form.fecha_fin).getTime();
    if (start >= end) {
      alert('❌ Error: La fecha final debe ser posterior a la fecha de inicio.');
      return;
    }

    // Save to context
    console.log('Saving promotion draft:', form);
    setPromotionDraft(form);
    // Navigate to step 2
    router.push('/admin/add-promotions/aplicar');
  };

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900">Promoción</h1>
      <form className="space-y-6" onSubmit={handleNext}>
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block mb-2 font-semibold">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-4 py-2"
          />
        </div>
        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block mb-2 font-semibold">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            rows={2}
            className="w-full rounded-md border px-4 py-2"
          />
        </div>
        {/* Imagen URL */}
        <div>
          <label htmlFor="img_promocional" className="block mb-2 font-semibold">
            Imagen (URL)
          </label>
          <input
            id="img_promocional"
            name="img_promocional"
            value={form.img_promocional}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-4 py-2"
          />
        </div>
        {/* Fecha Inicio */}
        <div>
          <label htmlFor="fecha_inicio" className="block mb-2 font-semibold">
            Fecha Inicio
          </label>
          <input
            id="fecha_inicio"
            name="fecha_inicio"
            type="date"
            value={form.fecha_inicio}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-4 py-2"
          />
        </div>
        {/* Fecha Fin */}
        <div>
          <label htmlFor="fecha_fin" className="block mb-2 font-semibold">
            Fecha Fin
          </label>
          <input
            id="fecha_fin"
            name="fecha_fin"
            type="date"
            value={form.fecha_fin}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-4 py-2"
          />
          {errorFecha && <p className="text-red-500 text-sm mt-1">{errorFecha}</p>}
        </div>
        {/* Porcentaje Descuento */}
        <div>
          <label htmlFor="porcentaje_descuento" className="block mb-2 font-semibold">
            Porcentaje Descuento
          </label>
          <input
            id="porcentaje_descuento"
            name="porcentaje_descuento"
            type="number"
            value={form.porcentaje_descuento}
            onChange={handleChange}
            required
            min={0}
            max={100}
            step="0.01"
            className="w-full rounded-md border px-4 py-2"
          />
          </div>

        {/* Prioridad de la Promoción */}
        <div>
          <label htmlFor="nivel" className="block mb-2 font-semibold">
            Prioridad de la Promoción
          </label>
          <select
            id="nivel"
            name="nivel"
            value={form.nivel}
            onChange={e => {
              const value = Number(e.target.value);
              setForm(prev => ({ ...prev, nivel: value }));
            }}
            required
            className="w-full rounded-md border px-4 py-2"
          >
            <option value={3}>3 (Alta prioridad)</option>
            <option value={2}>2 (Media prioridad)</option>
            <option value={1}>1 (Baja prioridad)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">3 es la prioridad más alta, 1 la más baja.</p>
        </div>
        {/* Combinable */}
        <div className="flex items-center">
          <input
            id="combinable"
            name="combinable"
            type="checkbox"
            checked={form.combinable}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="combinable" className="font-semibold">
            ¿Es combinable con otras promociones?
          </label>
        </div>

        <button
          type="submit"
          disabled={
            !!errorFecha ||
            !form.nombre ||
            !form.descripcion ||
            !form.img_promocional ||
            !form.fecha_inicio ||
            !form.fecha_fin ||
            form.porcentaje_descuento < 0 ||
            !form.nivel
          }
          className="w-full mt-8 py-3 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          Siguiente
        </button>
      </form>
    </div>
  );
}
