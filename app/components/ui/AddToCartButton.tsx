"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useStock } from "@/app/hooks/useStock";
import { useToast } from "@/app/context/ToastContext";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import type { CartItem } from "@/app/types/itemCarrito";
// Para enviar a google analytics
import { sendGAEvent } from "@next/third-parties/google";

interface AddToCartButtonProps {
  productId: number | undefined;
  nombre: string;
  precio: number;
  precioOriginal?: number;
  imagen?: string;
  className?: string;
}

/**
 * AddToCartButton - Botón para agregar productos al carrito
 *
 * Implementa las Heurísticas de Nielsen:
 * - #1 Visibilidad del estado del sistema: Muestra estados de carga y confirmación
 * - #3 Control y libertad del usuario: Permite agregar productos fácilmente
 * - #5 Prevención de errores: Deshabilita el botón cuando no hay stock
 * - #9 Ayuda a reconocer errores: Mensajes claros cuando hay problemas
 */
export const AddToCartButton = ({
  productId,
  nombre,
  precio,
  precioOriginal,
  imagen = "",
  className = "",
}: AddToCartButtonProps) => {
  const { cart, addItem } = useCart();
  const { showCartToast, showError, showInfo } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Always call the hook, but handle the conditional logic inside
  const { stock, loading } = useStock(productId || 0);

  // Buscar el ítem actual en el carrito
  const itemEnCarrito = cart.find((item) => item.productId === productId);
  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0;

  const handleAddToCart = async () => {
    if (productId === undefined) {
      return;
    }

    if (loading) {
      showInfo("Verificando disponibilidad del producto...");
      return;
    }

    if (stock === null || stock <= 0) {
      showError("Este producto no tiene stock disponible.");
      return;
    }

    if (cantidadEnCarrito >= stock) {
      showInfo("Ya agregaste la cantidad máxima disponible de este producto.");
      return;
    }

    setIsAdding(true);

    const basePrice = precioOriginal ?? precio;
    const descuento = basePrice > 0 ? 1 - precio / basePrice : 0;

    const item: CartItem = {
      productId,
      nombre,
      descripcion: "",
      image_producto: imagen || "",
      cantidad: 1,
      precio,
      precioOriginal: basePrice,
      descuento: descuento > 0 ? Number(descuento.toFixed(4)) : undefined,
    };

    try {
      await addItem(item);

      // Mostrar animación de éxito y toast
      setJustAdded(true);
      showCartToast(nombre, imagen);

      sendGAEvent("event", "add_to_cart", {
        item_id: productId,
        item_name: nombre,
        category: "Productos",
        price: precio,
        quantity: 1,
      });

      // Resetear el estado después de la animación
      setTimeout(() => {
        setJustAdded(false);
      }, 1500);
    } catch {
      showError("No pudimos agregar el producto. Intenta nuevamente.");
    } finally {
      setIsAdding(false);
    }
  };

  const disabled =
    loading ||
    stock === null ||
    stock <= 0 ||
    cantidadEnCarrito >= stock ||
    isAdding;

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled}
      aria-label={
        loading
          ? "Cargando disponibilidad del producto"
          : stock === 0
          ? `${nombre} sin stock disponible`
          : cantidadEnCarrito >= (stock ?? 0)
          ? `Cantidad máxima de ${nombre} alcanzada`
          : `Agregar ${nombre} al carrito de compras`
      }
      title={
        loading
          ? "Cargando stock..."
          : stock === 0
          ? "Sin stock disponible"
          : cantidadEnCarrito >= (stock ?? 0)
          ? "Cantidad máxima alcanzada"
          : "Agregar al carrito"
      }
      className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
        ${
          justAdded
            ? "bg-green-500 scale-110"
            : "bg-slate-800 hover:bg-slate-700 hover:scale-105"
        } ${className}`}
    >
      {isAdding ? (
        <Loader2
          size={24}
          className="animate-spin text-white"
          aria-hidden="true"
        />
      ) : justAdded ? (
        <Check
          size={24}
          className="text-white animate-bounce-in"
          aria-hidden="true"
        />
      ) : (
        <ShoppingCart size={24} color="white" aria-hidden="true" />
      )}
      <span className="sr-only">Agregar al carrito</span>
    </button>
  );
};
