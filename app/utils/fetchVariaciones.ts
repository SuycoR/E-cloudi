// app/utils/fetchVariaciones.ts

export async function fetchVariaciones(
  id_categoria_1: number,
  id_categoria_2: number,
  id_categoria_3: number
) {
  const response = await fetch(
    `/api/variaciones?id_categoria_1=${id_categoria_1}&id_categoria_2=${id_categoria_2}&id_categoria_3=${id_categoria_3}`
  );

  if (!response.ok) {
    throw new Error('Error fetching variaciones');
  }

  const data = await response.json();
  return data;
}
