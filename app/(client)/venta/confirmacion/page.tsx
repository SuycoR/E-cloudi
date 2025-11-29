"use client";

import { useEffect } from "react";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useBoleta } from "@/app/hooks/useBoleta";
import { CheckCircle2, Package, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/app/utils/formatPrice";

export default function ConfirmacionPage() {
  const { orden } = useCheckout();
  const { generar } = useBoleta();

  // Generate receipt on mount
  useEffect(() => {
    if (orden.total && orden.total > 0) {
      generar();
    }
  }, []);

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 sm:py-16"
      aria-label="Confirmación de pedido exitoso"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        {/* Success Icon */}
        <div
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          aria-hidden="true"
        >
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          ¡Gracias por tu compra!
        </h1>
        <p
          className="text-lg text-gray-600 mb-8"
          role="status"
          aria-live="polite"
        >
          Tu pedido ha sido procesado exitosamente
        </p>

        {/* Order Summary Card */}
        <article
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8 text-left"
          aria-labelledby="order-summary-title"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Package className="w-6 h-6 text-sky-500" aria-hidden="true" />
            <h2
              id="order-summary-title"
              className="text-lg font-semibold text-gray-900"
            >
              Resumen del pedido
            </h2>
          </div>

          <dl className="space-y-4">
            {/* Customer Info */}
            <div className="flex justify-between items-start">
              <div>
                <dt className="text-sm text-gray-500 mb-0.5">Cliente</dt>
                <dd className="font-medium text-gray-900">
                  {orden.nombre} {orden.apellido}
                </dd>
              </div>
              <div className="text-right">
                <dt className="text-sm text-gray-500 mb-0.5">Email</dt>
                <dd className="font-medium text-gray-900">{orden.email}</dd>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="pt-4 border-t border-gray-100">
              <dt className="text-sm text-gray-500 mb-1">
                Dirección de entrega
              </dt>
              <dd className="font-medium text-gray-900">
                {orden.direccionResumen || "Recojo en tienda"}
              </dd>
              {orden.fechaEntrega && (
                <dd className="text-sm text-gray-600 mt-1">
                  {orden.fechaEntrega} • {orden.franjaEntrega}
                </dd>
              )}
              {orden.destinatario && (
                <dd className="text-sm text-gray-600">
                  Destinatario: {orden.destinatario}
                </dd>
              )}
            </div>

            {/* Payment Info */}
            <div className="pt-4 border-t border-gray-100">
              <dt className="text-sm text-gray-500 mb-1">Método de pago</dt>
              <dd className="font-medium text-gray-900">
                {orden.metodoPagoNombre || "Tarjeta"}
              </dd>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <dt className="text-lg font-semibold text-gray-900">
                Total pagado
              </dt>
              <dd
                className="text-2xl font-bold text-sky-600"
                aria-label={`Total pagado: ${formatPrice(orden.total || 0)}`}
              >
                {formatPrice(orden.total || 0)}
              </dd>
            </div>
          </dl>
        </article>

        {/* Email Notice */}
        <div
          className="bg-sky-50 rounded-xl p-4 flex items-center gap-3 mb-8"
          role="status"
          aria-live="polite"
        >
          <Mail
            className="w-6 h-6 text-sky-600 flex-shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm text-sky-800 text-left">
            Hemos enviado un correo de confirmación a{" "}
            <strong>{orden.email}</strong> con los detalles de tu pedido y la
            boleta electrónica.
          </p>
        </div>

        {/* Action Buttons */}
        <nav
          className="flex flex-col sm:flex-row gap-4 justify-center"
          aria-label="Acciones post-compra"
        >
          <Link
            href="/profile/pedidos"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Ver historial de mis pedidos"
          >
            Ver mis pedidos
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-full font-semibold hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
            aria-label="Volver a la tienda para seguir comprando"
          >
            Seguir comprando
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </main>
  );
}
