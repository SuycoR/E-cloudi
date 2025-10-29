"use client";

import Link from "next/link";
//import clsx from 'clsx';
import { Minus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useSession } from "next-auth/react";
import { useCheckout } from "@/app/context/CheckoutContext";
import { formatPrice } from "@/app/utils/formatPrice";
import { QuantityButton } from "@/app/components/ui/QuantityButton";
import { useEffect } from "react";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { orden, setOrden } = useCheckout();
  const { data: session } = useSession();

  // Calcular subtotales
  const subtotalSinDescuento = cart.reduce(
    (sum, i) => sum + (i.precioOriginal ?? i.precio) * i.cantidad,
    0
  );
  const subtotalConDescuento = cart.reduce(
    (sum, i) => sum + i.precio * i.cantidad,
    0
  );
  const ahorro = subtotalSinDescuento - subtotalConDescuento;
  const itemsQty = cart.reduce((s, i) => s + i.cantidad, 0);

  useEffect(() => {
    if (session?.user?.id && orden.usuarioId !== session.user.id) {
      setOrden({
        ...orden,
        usuarioId: session.user.id,
      });
    }
  }, [session, orden, setOrden]);

  const handleRealizarPedido = () => {
    setOrden((prev) => ({
      ...prev,
      subtotal: subtotalConDescuento,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ebony-50 to-ebony-100/30 py-4 sm:py-6">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="p-1.5 bg-gradient-to-r from-ebony-900 to-ebony-900 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ebony-900">
              Mi Carrito
            </h1>
          </div>
          <p className="text-sm sm:text-base text-ebony-600 font-medium">
            {itemsQty} {itemsQty === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Lista de productos */}
          <section className="flex-1 lg:max-w-3xl">
            {cart.length === 0 ? (
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-lg border border-ebony-200/50">
                <div className="mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 bg-gradient-to-br from-ebony-100 to-ebony-200 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-ebony-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-ebony-700 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-ebony-500 text-sm sm:text-base">
                    Descubre nuestros increíbles productos
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ebony-700 text-white rounded-lg hover:bg-ebony-800 transition-all duration-300 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al catálogo
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:space-y-4">
                  {cart.map((item) => (
                    <article
                      key={item.productId}
                      className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-ebony-200/50 hover:border-ebony-300/50 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <div className="flex gap-4 flex-1 min-w-0">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                            <Link
                              href={`/productos/${item.productId}`}
                              prefetch={true}
                            >
                              <div className="w-full h-full bg-gradient-to-br from-ebony-100 to-ebony-200 rounded-lg overflow-hidden hover:ring-2 hover:ring-ebony-300 transition-all duration-300 group-hover:scale-105">
                                <img
                                  src={item.image_producto}
                                  alt={item.nombre}
                                  className="w-full h-full object-contain p-2"
                                />
                              </div>
                            </Link>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/productos/${item.productId}`}
                              className="block hover:text-ebony-700 transition-colors duration-300"
                            >
                              <h3 className="font-bold text-base sm:text-lg text-ebony-950 truncate mb-1">
                                {item.nombre}
                              </h3>
                            </Link>
                            <p className="text-sm text-ebony-600 mt-1 line-clamp-2 sm:line-clamp-1 leading-relaxed">
                              {item.descripcion}
                            </p>
                            <div className="mt-2 sm:hidden">
                              {item.precioOriginal &&
                                item.precioOriginal !== item.precio && (
                                  <span className="text-sm text-ebony-500 line-through mr-2">
                                    {formatPrice(
                                      item.precioOriginal * item.cantidad
                                    )}
                                  </span>
                                )}
                              <span className="font-bold text-lg text-red-600">
                                {formatPrice(item.precio * item.cantidad)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                          <div className="flex items-center bg-ebony-100 rounded-lg p-1 shadow-sm border border-ebony-200">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.cantidad - 1
                                )
                              }
                              disabled={item.cantidad <= 1}
                              className="p-2 sm:p-1.5 rounded-md hover:bg-white disabled:opacity-50 hover:scale-110 transition duration-200 focus:outline-none focus:ring-2 focus:ring-ebony-300 hover:shadow-md"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-ebony-700" />
                            </button>
                            <span className="px-3 sm:px-2 text-sm font-bold min-w-[2.5rem] sm:min-w-[2rem] text-center text-ebony-950">
                              {item.cantidad}
                            </span>
                            <QuantityButton
                              item={item}
                              size="sm"
                              className="p-2 sm:p-1.5 rounded-md hover:bg-white hover:scale-110 transition duration-200 focus:outline-none focus:ring-2 focus:ring-ebony-300 hover:shadow-md"
                            />
                          </div>
                          <div className="hidden sm:block text-right min-w-[6rem]">
                            {item.precioOriginal &&
                              item.precioOriginal !== item.precio && (
                                <div className="text-sm text-ebony-500 line-through">
                                  {formatPrice(
                                    item.precioOriginal * item.cantidad
                                  )}
                                </div>
                              )}
                            <div className="font-bold text-lg text-red-600">
                              {formatPrice(item.precio * item.cantidad)}
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-2 rounded-full hover:bg-gray-100 text-ebony-400 hover:text-gray-600 transition duration-300 flex-shrink-0 hover:scale-110 hover:shadow-md"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={clearCart}
                    className="px-6 py-2 bg-ebony-200 text-ebony-700 rounded-lg hover:bg-ebony-300 transition duration-300 font-semibold text-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </>
            )}
          </section>

          {cart.length > 0 && (
            <aside className="lg:w-80 lg:flex-shrink-0">
              <div className="sticky lg:top-6 bg-white rounded-xl p-6 shadow-lg border border-ebony-200/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-ebony-900 mb-4">
                  Resumen
                </h3>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-ebony-600">
                    <span>Subtotal antes de descuento</span>
                    <span className="line-through">
                      {formatPrice(subtotalSinDescuento)}
                    </span>
                  </div>
                  <div className="flex justify-between text-ebony-600">
                    <span>Subtotal con descuento</span>
                    <span className="text-red-600 font-medium">
                      {formatPrice(subtotalConDescuento)}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Ahorro</span>
                    <span>-{formatPrice(ahorro)}</span>
                  </div>
                  <hr className="border-ebony-200" />
                  <div className="flex justify-between font-semibold text-ebony-900">
                    <span>Total</span>
                    <span>{formatPrice(subtotalConDescuento)}</span>
                  </div>
                </div>
                <Link
                  href="/venta/metodo-pago"
                  className="block w-full py-3 text-center rounded-lg font-bold shadow-lg transition-all bg-ebony-700 text-white hover:bg-ebony-800 transform hover:-translate-y-0.5"
                  onClick={handleRealizarPedido}
                >
                  Realizar pedido
                </Link>
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-ebony-500">
                  <div className="w-2 h-2 bg-ebony-700 rounded-full" /> Pago
                  seguro y protegido
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
