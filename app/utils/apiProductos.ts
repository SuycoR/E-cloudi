// /app/utils/apiProductos.ts

export async function guardarProducto(data: {
  productoGeneral: Record<string, unknown>;
  productosEspecificos: Record<string, unknown>[];
}) {
  try {
    const response = await fetch('/api/productos/guardar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al guardar producto');
    }

    return result;
  } catch (error) {
    console.error('Error en apiProductos.guardarProducto:', error);
    throw error;
  }
}
