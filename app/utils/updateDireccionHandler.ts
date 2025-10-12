// utils/updateDireccionHandler.ts
export const updateDireccionHandler = async (data: {
  direccion_id: number;
  usuario_id: number;
  piso: string;
  lote: string;
  calle: string;
  distrito: string;
  codigo_postal: string;
}) => {
  try {
    const response = await fetch("/api/direccion/editar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { ok: false, mensaje: result.error || "Error al actualizar dirección" };
    }

    return { ok: true, mensaje: result.message || "Dirección actualizada" };
  } catch (error) {
    console.error("Error en updateDireccionHandler:", error);
    return { ok: false, mensaje: "Error del servidor" };
  }
};
