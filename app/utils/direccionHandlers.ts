// utils/direccionHandlers.ts
interface FormDataDireccion {
  piso: string | null;
  lote: string | null;
  calle: string | null;
  distrito: string | null;
  codigo_postal: string | null;
}

export async function crearDireccion(
  formData: FormDataDireccion,
  usuarioId: number
): Promise<{ ok: boolean; mensaje: string }> {
  const body = {
    usuario_id: usuarioId,
    piso: formData.piso,
    lote: formData.lote,
    calle: formData.calle,
    distrito: formData.distrito,
    codigo_postal: formData.codigo_postal,
  };

  try {
    const res = await fetch("/api/direccion/anadir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      return { ok: true, mensaje: data.resultado || "Dirección creada" };
    } else {
      return { ok: false, mensaje: data.resultado || "Error desconocido" };
    }
  } catch (err) {
    console.error("Error de red:", err);
    return { ok: false, mensaje: "Error de red al guardar dirección" };
  }
}
