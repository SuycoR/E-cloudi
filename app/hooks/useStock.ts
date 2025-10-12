// hooks/useStock.ts
import { useEffect, useState } from 'react';

export function useStock(productId: number) {
  const [stock, setStock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch(`/api/stock/${productId}`);
        const data = await res.json();

        if (res.ok) {
          setStock(data.Cantidad_stock);
        } else {
          console.error('Error al obtener stock:', data.error);
        }
      } catch (err) {
        console.error('Error al hacer fetch del stock:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchStock();
    }
  }, [productId]);

  return { stock, loading };
}
