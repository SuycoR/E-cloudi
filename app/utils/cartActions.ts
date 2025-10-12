// utils/cartActions.ts

import { CartItem } from '@/app/types/itemCarrito';

/**
 * GET /api/cart
 */
export async function fetchCartItems(): Promise<CartItem[]> {
  const res = await fetch('/api/cart');
  if (!res.ok) throw new Error('Error cargando carrito');
  const data = await res.json();
  return data.items;
}

/**
 * POST /api/cart/addOrUpdate
 */
export async function addOrUpdateItem(item: CartItem) {
  const res = await fetch('/api/cart/addOrUpdate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || 'Error al agregar ítem al carrito');
  }

  return res.json();
}

/**
 * DELETE /api/cart/[productId]
 */
export async function removeItemById(productId: number) {
  const res = await fetch(`/api/cart/${productId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || 'Error al eliminar ítem');
  }

  return res.json();
}

/**
 * PATCH /api/cart/[productId]
 */
// utils/cartActions.ts

export async function updateItemQuantity(productId: number, quantity: number) {
  try {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data?.error || 'Error al actualizar cantidad' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Error de red o servidor' };
  }
}


/**
 * DELETE /api/cart/DeleteAll
 */

export async function clearAllCartItems() {
  const res = await fetch('/api/cart/DeleteAll', {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || 'Error al vaciar el carrito');
  }

  return res.json();
}
