import { apiFetch } from './client';

export const agregarChecklistItem = async (
  token: string,
  cardId: string,
  item: { nombre: string; completado: boolean }
) => {
  const res = await apiFetch(`/cards/${cardId}/checklist`, token, {
    method: 'PATCH',
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al agregar ítem de checklist');
  return data;
};

export const actualizarChecklistItem = async (
  token: string,
  cardId: string,
  itemId: number,
  actualizado: { nombre: string; completado: boolean }
) => {
  const res = await apiFetch(`/cards/${cardId}/checklist/${itemId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(actualizado),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al actualizar ítem');
  return data;
};

export const eliminarChecklistItem = async (
  token: string,
  cardId: string,
  itemId: number
) => {
  const res = await apiFetch(`/cards/${cardId}/checklist/${itemId}`, token, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al eliminar ítem del checklist');
  return data;
};

export const obtenerChecklist = async (token: string, cardId: string) => {
  const res = await apiFetch(`/cards/${cardId}/checklist`, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener checklist');
  return data;
};
