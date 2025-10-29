"use client";

import React from "react";
import { RotateCcw, RefreshCcw, Repeat } from "lucide-react";
import ProfileOrdersList from "@/app/components/profile/ProfileOrdersList";
import { useProfileMockData } from "@/app/hooks/useProfileMockData";

export default function DevolucionesCambiosPage() {
  const { dataset, loading, error } = useProfileMockData();

  if (loading) {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Cargando devoluciones y cambios de ejemplo...
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error ?? "No pudimos cargar las devoluciones y cambios de ejemplo."}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">
          Mis movimientos
        </p>
        <h1 className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
          <RotateCcw className="h-7 w-7 text-sky-700" /> Devoluciones y cambios
        </h1>
        <p className="text-sm text-slate-500">
          Aquí verás el estado de tus solicitudes recientes. Los datos son
          referenciales.
        </p>
      </header>

      <ProfileOrdersList
        title="Devoluciones recientes"
        Icon={RefreshCcw}
        emptyMessage="Aún no registras devoluciones."
        entries={dataset.devoluciones}
      />

      <ProfileOrdersList
        title="Cambios recientes"
        Icon={Repeat}
        emptyMessage="Cuando solicites un cambio aparecerá aquí."
        entries={dataset.cambios}
      />
    </div>
  );
}
