import { apiFetch } from './client';

export const obtenerEtiquetas = async (token: string, cardId: string) => {
  const res = await apiFetch(`/cards/${cardId}/etiquetas`, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener etiquetas');
  return data;
};

export const agregarEtiqueta = async (
  token: string,
  cardId: string,
  etiqueta: { nombre: string; color: string }
) => {
  const res = await apiFetch(`/cards/${cardId}/etiquetas`, token, {
    method: 'PATCH',
    body: JSON.stringify(etiqueta),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al agregar etiqueta');
  return data;
};

export const eliminarEtiqueta = async (
  token: string,
  cardId: string,
  itemId: number
) => {
  const res = await apiFetch(`/cards/${cardId}/etiquetas/${itemId}`, token, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al eliminar etiqueta');
  return data;
};
