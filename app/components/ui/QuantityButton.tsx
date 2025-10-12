'use client';

import { useCart } from '@/app/context/CartContext';
import { useStock } from '@/app/hooks/useStock';
import { Plus } from 'lucide-react';
import { CartItem } from '@/app/types/itemCarrito';

interface QuantityButtonProps {
  item: CartItem;
  size?: 'sm' | 'md';
  className?: string;
}

export const QuantityButton = ({ item, size = 'md', className = '' }: QuantityButtonProps) => {
  const { updateQuantity } = useCart();
  const { stock, loading } = useStock(item.productId);

  const handleIncrement = () => {
    if (stock !== null && item.cantidad < stock) {
      updateQuantity(item.productId, item.cantidad + 1);
    }
  };

  const disabled = loading || stock === null || item.cantidad >= stock;

  const sizeClasses = size === 'sm' ? 'p-1.5 w-7 h-7' : 'p-2 w-9 h-9';

  return (
    <button
      onClick={handleIncrement}
      disabled={disabled}
      className={`${sizeClasses} ${className} rounded-md hover:bg-white hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label="Aumentar cantidad"
      title={
        loading
          ? 'Cargando stock...'
          : item.cantidad >= (stock || 0)
          ? 'Stock máximo alcanzado'
          : 'Aumentar cantidad'
      }
    >
      <Plus className={`text-gray-700 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
    </button>
  );
};
