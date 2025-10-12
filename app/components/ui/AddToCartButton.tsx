'use client';

import { useCart } from '@/app/context/CartContext';
import { useStock } from '@/app/hooks/useStock';
import { ShoppingCart } from 'lucide-react';
import type { CartItem } from '@/app/types/itemCarrito';
// Para enviar a google analytics
import { sendGAEvent } from "@next/third-parties/google";


interface AddToCartButtonProps {
  productId: number | undefined;
  nombre: string;
  precio: number;
  imagen?: string;
  className?: string;
}

export const AddToCartButton = ({
  productId,
  nombre,
  precio,
  imagen = '',
  className = '',
}: AddToCartButtonProps) => {
  const { cart, addItem } = useCart();

  // Always call the hook, but handle the conditional logic inside
  const { stock, loading } = useStock(productId || 0);
  const isValidProduct = productId !== undefined;

  // Buscar el ítem actual en el carrito
  const itemEnCarrito = cart.find((item) => item.productId === productId);
  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0;

  const handleAddToCart = async () => {
    if (productId === undefined) {
      console.error('ID de producto indefinido');
      return;
    }

    if (loading) {
      alert('Verificando stock...');
      return;
    }

    if (stock === null || stock <= 0) {
      alert('Producto sin stock disponible.');
      return;
    }

    if (cantidadEnCarrito >= stock) {
      alert('Ya agregaste el máximo disponible de este producto.');
      return;
    }

    const item: CartItem = {
      productId,
      nombre,
      descripcion: '',
      image_producto: imagen || '',
      cantidad: 1,
      precio,
    };

    try {
      await addItem(item);
      sendGAEvent("event", "add_to_cart", {
      item_id: productId,
      item_name: nombre,
      category: "Productos", 
      price: precio,
      quantity: 1,
    });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };

  const disabled =
    loading || stock === null || stock <= 0 || cantidadEnCarrito >= stock;

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled}
      title={
        loading
          ? 'Cargando stock...'
          : stock === 0
          ? 'Sin stock disponible'
          : cantidadEnCarrito >= (stock ?? 0)
          ? 'Cantidad máxima alcanzada'
          : 'Agregar al carrito'
      }
      className={`p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <ShoppingCart size={24} color="white" />
    </button>
  );
};
