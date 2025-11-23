"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/app/utils/formatPrice";
import { QuantityButton } from "@/app/components/ui/QuantityButton";
import { Minus, Trash2 } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();

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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-ebony-50">
      <div className="container-padding pt-6 pb-8">
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          {/* Lista de productos */}
          <section className="flex-1 xl:max-w-4xl">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-xl font-semibold text-gray-900">
                Carrito de compras
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {cart.length} {cart.length === 1 ? "producto" : "productos"}
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-sm">
                <p className="text-gray-600 mb-4 text-base sm:text-lg">
                  Tu carrito está vacío
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Volver al catálogo
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Imagen y detalles */}
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                          <Link
                            href={`/productos/${item.productId}`}
                            prefetch={true}
                          >
                            <img
                              src={item.image_producto}
                              alt={item.nombre}
                              className="w-full h-full object-contain rounded-lg cursor-pointer hover:scale-105 transition-transform"
                            />
                          </Link>
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/productos/${item.productId}`}
                            className="block hover:text-red-600 transition-colors"
                          >
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                              {item.nombre}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2 sm:line-clamp-1">
                            {item.descripcion}
                          </p>

                          {/* Precio en móvil */}
                          <div className="mt-2 sm:hidden">
                            {item.precioOriginal && item.precioOriginal !== item.precio && (
                              <span className="text-sm text-gray-500 line-through mr-2">
                                {formatPrice(item.precioOriginal * item.cantidad)}
                              </span>
                            )}
                            <span className="font-bold text-lg text-red-600">
                              {formatPrice(item.precio * item.cantidad)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center justify-between sm:justify-end sm:items-center gap-4 sm:gap-6">
                        {/* Controles de cantidad */}
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 shadow-sm">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.cantidad - 1)
                            }
                            disabled={item.cantidad <= 1}
                            className="p-2 sm:p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-all cursor-pointer duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-700" />
                          </button>
                          <span className="px-3 sm:px-2 text-sm font-semibold min-w-[2.5rem] sm:min-w-[2rem] text-center">
                            {item.cantidad}
                          </span>
                          <QuantityButton
                            item={item}
                            size="sm"
                            className="p-2 sm:p-1.5 rounded-md hover:bg-white hover:scale-110 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        {/* Precio en desktop */}
                        <div className="hidden sm:block text-right min-w-[6rem]">
                          {item.precioOriginal && item.precioOriginal !== item.precio && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(item.precioOriginal * item.cantidad)}
                            </div>
                          )}
                          <div className="font-bold text-lg text-red-600">
                            {formatPrice(item.precio * item.cantidad)}
                          </div>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer transition-all duration-200 flex-shrink-0"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Resumen */}
          {cart.length > 0 && (
            <aside className="xl:w-80 xl:flex-shrink-0">
              <div className="sticky top-4">
                <h2 className="text-xl sm:text-xl font-semibold text-gray-900 mb-4">
                  Resumen
                </h2>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span className="text-sm sm:text-base">
                        Subtotal antes de descuento
                      </span>
                      <span className="text-sm sm:text-base line-through text-gray-400">
                        {formatPrice(subtotalSinDescuento)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="text-sm sm:text-base">
                        Subtotal con descuento
                      </span>
                      <span className="font-medium text-red-600 text-sm sm:text-base">
                        {formatPrice(subtotalConDescuento)}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-700 font-medium">
                      <span className="text-sm sm:text-base">Ahorro</span>
                      <span className="text-sm sm:text-base">
                        -{formatPrice(ahorro)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="text-sm sm:text-base">Envío</span>
                      <span className="font-medium text-green-600 text-sm sm:text-base">
                        Gratis
                      </span>
                    </div>
                  </div>

                  <hr className="border-gray-200 my-4" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg sm:text-xl text-gray-900">
                      Total a pagar
                    </span>
                    <span className="font-bold text-xl sm:text-2xl text-black-600">
                      {formatPrice(subtotalConDescuento)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        sendGAEvent("event", "begin_checkout", {
                          currency: "PEN",
                          value: subtotalConDescuento
                        });
                      }}
                      className="w-full py-2 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors font-semibold text-sm sm:text-base shadow-sm hover:shadow-md"
                    >
                      Proceder al pago
                    </button>

                    <button
                      onClick={clearCart}
                      className="w-full py-2 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors font-medium text-sm sm:text-base"
                    >
                      Vaciar carrito
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-500 text-center">
                      Pago seguro y protegido
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
