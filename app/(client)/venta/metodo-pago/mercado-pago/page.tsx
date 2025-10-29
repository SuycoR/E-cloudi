"use client";

import Link from "next/link";

export default function MercadoPagoLegacyPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
      <div className="space-y-3 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">
          Pasarela deshabilitada
        </h1>
        <p className="text-sm text-gray-600">
          El flujo de Mercado Pago ya no está disponible. Ahora la experiencia
          de pago se simula directamente en el paso «Método de pago» del
          checkout.
        </p>
      </div>
      <Link
        href="/venta/metodo-pago"
        className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Ir al nuevo checkout
      </Link>
    </div>
  );
}
