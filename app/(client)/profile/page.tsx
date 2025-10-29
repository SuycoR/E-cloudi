"use client";

import React from "react";
import Link from "next/link";
import { Package, ClipboardList, RefreshCcw, Sparkles } from "lucide-react";
import {
  useProfileMockData,
  type ProfileMockEntry,
} from "@/app/hooks/useProfileMockData";

const FALLBACK_IMAGE =
  "https://img.freepik.com/vector-gratis/ilustracion-icono-doodle-engranaje_53876-5596.jpg?semt=ais_hybrid&w=740";

const getProductImage = (src?: string | null) => {
  if (!src || src === "null") return FALLBACK_IMAGE;
  return src;
};

function EntryRow({ entry }: { entry: ProfileMockEntry }) {
  const { producto } = entry;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={getProductImage(producto.imagen)}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900 line-clamp-1">
            {producto.nombre}
          </p>
          <p className="text-sm text-slate-500">Código {entry.codigo}</p>
          <p className="text-sm text-slate-500">Actualizado: {entry.fecha}</p>
          <p className="text-sm font-medium text-sky-700">{entry.estado}</p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 lg:items-end">
        <span className="text-lg font-semibold text-slate-900">
          S/ {producto.precio.toFixed(2)}
        </span>
        <Link
          href={entry.accionHref}
          className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          {entry.accionLabel}
        </Link>
      </div>
    </div>
  );
}

export default function ProfileSummaryPage() {
  const { dataset, loading, error } = useProfileMockData({ initialize: true });
  const highlights = dataset?.highlights ?? [];
  const pedidos = dataset?.pedidos ?? [];
  const devoluciones = dataset?.devoluciones ?? [];
  const cambios = dataset?.cambios ?? [];

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">
          Mi StyleHub
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Resumen</h1>
        <p className="text-sm text-slate-500">
          Revisa el estado de tus pedidos, devoluciones y movimientos recientes.
        </p>
      </header>

      {loading ? (
        <div className="rounded-3xl border border-sky-100 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Cargando tu actividad más reciente...
        </div>
      ) : error || !dataset ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error ?? "No pudimos cargar tu resumen en este momento."}
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                    <Package className="h-6 w-6 text-sky-700" />
                    Pedidos recientes
                  </h2>
                  <p className="text-sm text-slate-500">
                    Tus últimos movimientos en la tienda.
                  </p>
                </div>
                <Link
                  href="/profile/pedidos"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 transition hover:border-sky-300 hover:text-sky-900"
                >
                  Ver todos
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {pedidos.length > 0 ? (
                  pedidos.map((entry) => (
                    <EntryRow key={`pedido-${entry.codigo}`} entry={entry} />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                    Aún no tienes pedidos. Cuando realices uno, lo verás aquí.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <RefreshCcw className="h-5 w-5 text-sky-700" />
                    Devoluciones recientes
                  </h2>
                  <Link
                    href="/profile/devoluciones-cambios"
                    className="text-xs font-medium text-sky-600 hover:text-sky-800"
                  >
                    Ver historial
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {devoluciones.length > 0 ? (
                    devoluciones.map((entry) => (
                      <EntryRow
                        key={`devolucion-${entry.codigo}`}
                        entry={entry}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No registras devoluciones recientemente.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <ClipboardList className="h-5 w-5 text-sky-700" />
                    Cambios recientes
                  </h2>
                  <Link
                    href="/profile/devoluciones-cambios"
                    className="text-xs font-medium text-sky-600 hover:text-sky-800"
                  >
                    Ver historial
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {cambios.length > 0 ? (
                    cambios.map((entry) => (
                      <EntryRow key={`cambio-${entry.codigo}`} entry={entry} />
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Cuando gestiones un cambio lo verás en esta sección.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {highlights.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-700" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Descubre más en StyleHub
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {highlights.map((producto) => (
                  <div
                    key={`highlight-${producto.especificoId}`}
                    className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-lg"
                  >
                    <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-slate-50">
                      <img
                        src={getProductImage(producto.imagen)}
                        alt={producto.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {producto.nombre}
                      </p>
                      <span className="text-lg font-bold text-slate-900">
                        S/ {producto.precio.toFixed(2)}
                      </span>
                      <Link
                        href={`/productos/${producto.especificoId}`}
                        className="inline-flex items-center justify-center rounded-full border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-400 hover:bg-sky-50"
                      >
                        Ver producto
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
