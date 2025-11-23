"use client";

import { useCart } from "@/app/context/CartContext";
import { useCheckout } from "@/app/context/CheckoutContext";
import { crearPreferenciaMP } from "./actions";

export const dynamic = "force-static";

export default function HomePage() {
  const { cart } = useCart();
  const { orden } = useCheckout();

  // Handler para el submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación: Si el método de envío requiere dirección, forzar que no sea null
    const requiereDireccion = orden.metodoEnvioId !== 1; // Ajusta el id según tu lógica (ej: 1=retiro en tienda)
    if (
      requiereDireccion &&
      (!orden.direccionEnvioId || orden.direccionEnvioId === null)
    ) {
      alert("Debes seleccionar una dirección de envío antes de continuar.");
      return;
    }
    // Log para debug: mostrar el cart completo antes de crear la preferencia
    console.log("DEBUG cart antes de crearPreferenciaMP:", cart);
    // Log para debug: mostrar el cartResumen que se enviará en metadata
    const cartResumenDebug = cart.map(
      ({ productId, precio, precioOriginal, descuento, cantidad }) => {
        let precioFinal = Number(precioOriginal);
        if (isNaN(precioFinal)) {
          precioFinal = Number(precio);
        }
        if (isNaN(precioFinal)) {
          precioFinal = 0;
        }
        return {
          id_producto_especifico: productId,
          precioOriginal: precioFinal,
          descuento: Number(descuento ?? 0),
          cantidad: Number(cantidad),
        };
      }
    );
    console.log("DEBUG cartResumen a enviar:", cartResumenDebug);
    // Llama a la server action pasando los datos necesarios
    await crearPreferenciaMP({
      cart: cart.map(
        ({
          productId,
          nombre,
          cantidad,
          precio,
          precioOriginal,
          descuento,
        }) => ({
          productId,
          nombre,
          cantidad,
          precio,
          precioOriginal,
          descuento,
          id_producto_especifico: productId,
        })
      ),
      metadata: {
        usuarioId: orden.usuarioId,
        direccionEnvioId: orden.direccionEnvioId ?? 0,
        metodoEnvioId: orden.metodoEnvioId,
        subtotal: orden.subtotal,
        costoEnvio: orden.costoEnvio,
        total: orden.total ?? 0,
        cartResumen: cart.map(
          ({ productId, precio, precioOriginal, descuento, cantidad }) => {
            let precioFinal = Number(precioOriginal);
            if (isNaN(precioFinal)) {
              precioFinal = Number(precio);
            }
            if (isNaN(precioFinal)) {
              precioFinal = 0;
            }
            return {
              id_producto_especifico: productId,
              precioOriginal: precioFinal,
              descuento: Number(descuento ?? 0),
              cantidad: Number(cantidad),
            };
          }
        ),
      },
    });
  };

  // DEBUG: Mostrar cart y cartResumen en el frontend antes de enviar
  const cartResumenDebug = cart.map(
    ({ productId, precio, precioOriginal, descuento, cantidad }) => {
      let precioFinal = Number(precioOriginal);
      if (isNaN(precioFinal)) {
        precioFinal = Number(precio);
      }
      if (isNaN(precioFinal)) {
        precioFinal = 0;
      }
      return {
        id_producto_especifico: productId,
        precioOriginal: precioFinal,
        descuento: Number(descuento ?? 0),
        cantidad: Number(cantidad),
      };
    }
  );

  return (
    <section className="grid gap-8">
      {/* DEBUG: Mostrar cart y cartResumen en el frontend */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">DEBUG: CartContext</h3>
        <pre className="text-xs overflow-x-auto bg-white p-2 rounded border border-gray-200 mb-2">
          {JSON.stringify(cart, null, 2)}
        </pre>
        <h3 className="font-bold mb-2">DEBUG: cartResumen a enviar</h3>
        <pre className="text-xs overflow-x-auto bg-white p-2 rounded border border-gray-200">
          {JSON.stringify(cartResumenDebug, null, 2)}
        </pre>
      </div>
      <form onSubmit={handleSubmit}>
        <button type="submit" className="btn btn-primary">
          Pagar con Mercado Pago
        </button>
      </form>
    </section>
  );
}
