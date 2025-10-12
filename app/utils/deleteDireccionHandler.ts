export async function deleteDireccionHandler(direccion_id: number, usuario_id: number) {
  try {
    const res = await fetch("/api/direccion/eliminar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direccion_id, usuario_id }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, mensaje: data.error || "Error al eliminar la dirección" };
    }

    return { ok: true, mensaje: data.message || "Dirección eliminada exitosamente" };
  } catch (error) {
    console.error("Error eliminando dirección:", error);
    return { ok: false, mensaje: "Error del servidor" };
  }
}
