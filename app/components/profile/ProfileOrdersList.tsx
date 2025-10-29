"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import type { ProfileMockEntry } from "@/app/hooks/useProfileMockData";

interface ProfileOrdersListProps {
  title: string;
  Icon: LucideIcon;
  emptyMessage: string;
  entries?: ProfileMockEntry[];
}

const FALLBACK_IMAGE =
  "https://img.freepik.com/vector-gratis/ilustracion-icono-doodle-engranaje_53876-5596.jpg?semt=ais_hybrid&w=740";

const ProfileOrdersList: React.FC<ProfileOrdersListProps> = ({
  title,
  Icon,
  emptyMessage,
  entries = [],
}) => {
  const getProductImage = (src?: string | null) => {
    if (!src || src === "null") return FALLBACK_IMAGE;
    return src;
  };

  return (
    <section className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <Icon className="h-7 w-7 text-sky-700" />
        {title}
      </h1>

      {entries.length > 0 ? (
        entries.map((entry) => (
          <div
            key={entry.codigo}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={getProductImage(entry.producto.imagen)}
                  alt={entry.producto.nombre}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {entry.producto.nombre}
                </p>
                <p className="text-sm text-slate-500">Código {entry.codigo}</p>
                <p className="text-sm text-slate-500">
                  Actualizado: {entry.fecha}
                </p>
                <p className="text-sm font-medium text-sky-700">
                  {entry.estado}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <span className="text-lg font-semibold text-slate-900">
                S/ {entry.producto.precio.toFixed(2)}
              </span>
              <a
                href={entry.accionHref}
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                {entry.accionLabel}
              </a>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          {emptyMessage}
        </div>
      )}
    </section>
  );
};

export default ProfileOrdersList;
