"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function ListaDeseosPage() {
  return (
    <section className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <Heart className="h-7 w-7 text-rose-500" />
        Lista de deseos
      </h1>

      <div className="rounded-3xl border border-dashed border-rose-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-800">
          Aún no tienes productos guardados en tu lista.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Explora nuestro catálogo y añade tus favoritos para encontrarlos
          rápidamente cuando regreses.
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600"
        >
          Descubrir productos
        </Link>
      </div>
    </section>
  );
}
