'use client';

/**
 * Paso 3 de 4 — Método de pago
 * Estilo consistente con Carrito y Direcciones (paleta «Ebony»)
 * ‑ Selector de métodos (Tarjeta, PayPal, Bizum, Transferencia)
 * ‑ Resumen lateral (mismo componente visual)
 * ‑ Botón "Pagar y finalizar" (deshabilitado hasta elegir método)
 */

import { useState } from 'react';
import { CreditCard, Wallet, Banknote, Check } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/app/context/CheckoutContext';


// 👉 Sustituye con tu propio subtotal / summary hook si lo tienes
const fakeCartSubtotal = 349.99;

export default function PagoPage() {
  const router = useRouter();
  const [method, setMethod] = useState<string | null>(null);
  const { orden, setOrden } = useCheckout();

  const paymentOptions = [
    { id: 'card',    label: 'Tarjeta de crédito', icon: CreditCard },
    { id: 'bizum',   label: 'Bizum',              icon: Wallet },
    { id: 'bank',    label: 'Transferencia',      icon: Banknote },
  ];

  const handlePay = () => {
    if (!method) return;
    // Aquí iría tu lógica de tokenización / redirección a gateway
    setOrden({
      ...orden,
      metodoPagoId: method === 'card' ? 1 :
                    method === 'bizum' ? 2 :
                    method === 'bank' ? 3 : null,
    });
    router.push('/venta/resumen');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ebony-50 to-ebony-100/30 py-4 sm:py-6">
      {/* Debug: mostrar datos del context de checkout */}
      <pre className="bg-yellow-50 text-xs text-yellow-900 border border-yellow-200 rounded p-2 mb-4 overflow-x-auto">
        <strong>orden (CheckoutContext):</strong>\n{JSON.stringify(orden, null, 2)}
      </pre>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-1.5 bg-gradient-to-r from-ebony-900 to-ebony-900 rounded-lg">
              <CreditCard className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ebony-900">
              Método de pago
            </h1>
          </div>
          <p className="text-sm sm:text-base text-ebony-600 font-medium">
            Paso 3 de 4 — selecciona cómo quieres pagar tu pedido
          </p>
        </header>

        {/* Grid principal */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Selector de métodos */}
          <section className="flex-1 xl:max-w-4xl space-y-4">
            {paymentOptions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={clsx(
                  'w-full flex items-center gap-4 p-5 rounded-xl border transition-all shadow-sm',
                  method === id
                    ? 'border-ebony-700 bg-white'
                    : 'border-ebony-200/50 hover:border-ebony-300/50 hover:shadow-md'
                )}
              >
                <div
                  className={clsx(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    method === id ? 'border-ebony-700 bg-ebony-700' : 'border-ebony-300'
                  )}
                >
                  {method === id && <Check className="w-3 h-3 text-white" />}
                </div>

                <Icon
                  className={clsx(
                    'w-6 h-6 flex-none',
                    method === id ? 'text-ebony-700' : 'text-ebony-400'
                  )}
                  aria-hidden="true"
                />

                <span
                  className={clsx(
                    'font-medium text-left',
                    method === id ? 'text-ebony-900' : 'text-ebony-700'
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </section>

          {/* Resumen lateral */}
          <aside className="lg:w-80 lg:flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-ebony-200/50 sticky top-6 backdrop-blur-sm">
              <h3 className="text-lg sm:text-xl font-bold text-ebony-900 mb-4">Resumen</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-ebony-600">Subtotal</span>
                  <span className="font-medium text-ebony-950">S/ {fakeCartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ebony-600">Envío</span>
                  <span className="font-medium text-ebony-950">Calculado antes de pagar</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-ebony-900">Total</span>
                    <span className="font-bold text-lg text-ebony-950">—</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={!method}
                className={clsx(
                  'w-full py-3 rounded-lg font-bold transition-colors',
                  method
                    ? 'bg-ebony-700 text-white hover:bg-ebony-800 shadow-lg hover:shadow-xl'
                    : 'bg-ebony-300/60 text-ebony-500 cursor-not-allowed'
                )}
              >
                Pagar y finalizar
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-ebony-500">
                <div className="w-2 h-2 bg-ebony-600 rounded-full" />
                <span>Pago seguro y protegido</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
