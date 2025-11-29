"use client";
import React, { useEffect, useState } from "react";
import { X, Trash2, Minus, ShoppingBag, ShoppingCart } from "lucide-react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/app/utils/formatPrice";
import type { DrawerProps } from "@/app/types/props";
import { QuantityButton } from "@/app/components/ui/QuantityButton";

const CartDrawer = ({ isOpen, onClose }: DrawerProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const subtotal = cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.cantidad, 0);

  const handleCloseDrawer = () => {
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={handleCloseDrawer}
      ></div>

      {/* Panel */}
      <aside role="dialog" aria-modal="true" aria-label="Carrito de compras">
        <div
          className={`fixed right-0 top-0 w-full max-w-full sm:max-w-sm lg:max-w-lg h-full bg-ebony-50 shadow-xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out ${
            isAnimating ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header mejorado */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-ebony-950" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-bounce-in">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-ebony-950">Mi carrito</h2>
              </div>

              <button
                className="p-2 hover:bg-gray-100 rounded-full hover:scale-110 transition-all duration-200"
                onClick={handleCloseDrawer}
                aria-label="Cerrar carrito"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="h-full flex justify-center items-center flex-col gap-6 px-6">
              <div className="w-32 h-32 mx-auto bg-ebony rounded-full flex items-center justify-center shadow-inner">
                <ShoppingBag
                  size={64}
                  strokeWidth={1.2}
                  className="text-ebony-950"
                />
              </div>

              <div className="text-center space-y-3">
                <p className="font-bold text-xl text-ebony-950">
                  Tu carrito está vacío
                </p>
                <p className="text-center text-sm px-4 leading-relaxed text-gray-600">
                  Descubre productos increíbles y añádelos a tu carrito para
                  comenzar tu experiencia de compra
                </p>
              </div>

              <Link href="/" onClick={handleCloseDrawer}>
                <button className="bg-ebony-950 text-white px-6 py-3 rounded-lg hover:bg-ebony-900 transition-all cursor-pointer duration-200 font-medium shadow-lg hover:scale-105">
                  Explorar productos
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Productos del carrito */}
              <div className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                  >
                    <div className="w-16 h-16 flex-shrink-0">
                      <Link
                        href={`/productos/${item.productId}`}
                        prefetch={true}
                        onClick={handleCloseDrawer}
                        aria-label={`Ver detalles de ${item.nombre}`}
                      >
                        <img
                          src={item.image_producto}
                          alt={`Imagen del producto ${item.nombre}`}
                          className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-200"
                        />
                      </Link>
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/productos/${item.productId}`}
                        onClick={handleCloseDrawer}
                      >
                        <h3 className="font-semibold text-sm text-ebony-950 hover:text-ebony-800 transition-colors mb-1">
                          {item.nombre}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {item.descripcion}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div
                          className="flex items-center bg-white rounded-lg p-1 shadow-sm"
                          role="group"
                          aria-label={`Cantidad de ${item.nombre}: ${item.cantidad}`}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.cantidad - 1)
                            }
                            disabled={item.cantidad <= 1}
                            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            aria-label={`Disminuir cantidad de ${item.nombre}`}
                          >
                            <Minus
                              className="w-3.5 h-3.5 text-gray-700"
                              aria-hidden="true"
                            />
                          </button>
                          <span
                            className="px-3 text-sm font-semibold min-w-[2rem] text-center"
                            aria-live="polite"
                            aria-atomic="true"
                          >
                            {item.cantidad}
                          </span>
                          <QuantityButton
                            item={item}
                            size="sm"
                            className="p-2 sm:p-1.5 rounded-md hover:bg-white hover:scale-110 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-right">
                          {item.descuento && item.descuento > 0 ? (
                            <>
                              <div className="flex flex-col sm:items-end">
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(
                                    (item.precioOriginal ?? item.precio) *
                                      item.cantidad
                                  )}
                                </span>
                                <span className="text-sm font-bold text-red-600">
                                  {formatPrice(item.precio * item.cantidad)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-ebony-950">
                              {formatPrice(item.precio * item.cantidad)}
                            </span>
                          )}
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-2 hover:bg-red-50 rounded-lg hover:scale-110 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 group"
                            aria-label={`Eliminar ${item.nombre} del carrito`}
                          >
                            <Trash2
                              className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen */}
              <div className="border-t border-gray-200 px-6 py-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-medium text-gray-700">
                    Subtotal ({totalItems}{" "}
                    {totalItems === 1 ? "producto" : "productos"})
                  </span>
                  <span className="text-lg font-bold text-ebony-950">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/venta/carro-compras" onClick={handleCloseDrawer}>
                    <button className="w-full py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all duration-200 font-semibold shadow-lg hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-300">
                      Ir al carrito
                    </button>
                  </Link>
                  <button
                    onClick={clearCart}
                    className="w-full py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 hover:scale-[1.02] cursor-pointer transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
};

export default CartDrawer;
