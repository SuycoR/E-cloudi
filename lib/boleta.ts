
import {GenerarBoletaPayload} from "@/app/types/GenerarBoletaPayload";

export async function enviarDatosBoletaApi(payload: GenerarBoletaPayload) {
  const resp = await fetch('/api/generar-boleta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || 'Error al enviar boleta');
  }
  return await resp.json();
}
