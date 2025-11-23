'use client';

import React, { useEffect } from 'react';
import { useCheckout } from '@/app/context/CheckoutContext';
import { useBoleta } from '@/app/hooks/useBoleta';
import { sendGAEvent } from '@next/third-parties/google';

export default function ResumenPage() {
  const { orden } = useCheckout();
  const { generar, error, success } = useBoleta();

  // Ejecutar generación de boleta al montar la página
  useEffect(() => {
    generar();
  }, [generar]);

  // Enviar evento de compra cuando la boleta se genera con éxito
  useEffect(() => {
    if (success) {
      sendGAEvent('event', 'purchase', {
        transaction_id: orden.usuarioId ?? 'sin_id',
        value: orden.total ?? 0,
        currency: 'PEN',
      });
    }
  }, [success, orden]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ebony-50 to-ebony-100/30 p-4">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ebony-900 mb-4">
          Agradecemos tu compra
        </h1>
        <p className="text-xl sm:text-2xl text-gray-700">
          Tu boleta se envió a tu correo.
        </p>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
