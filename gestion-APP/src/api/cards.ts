import { apiFetch } from './client';

export const obtenerCardsPorLista = async (token: string, listaId: string) => {
  const res = await apiFetch(`/listas/${listaId}/tarjetas`, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener tarjetas');
  return data;
};

export const obtenerCardPorId = async (token: string, _listaId: string, cardId: string) => {
  const res = await apiFetch(`/cards/${cardId}`, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener tarjeta');
  return { ...data, id: String(data.id ?? data._id) };
};

export const crearCardEnLista = async (
  token: string,
  listaId: string,
  data: { titulo: string; descripcion: string }
) => {
  const res = await apiFetch(`/listas/${listaId}/tarjetas`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.msg || 'Error al crear tarjeta');
  return result;
};

export const actualizarFechasCard = async (
  token: string,
  cardId: string,
  fechas: { fechaInicio?: string; fechaFin?: string }
) => {
  const res = await apiFetch(`/tarjetas/${cardId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(fechas),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al actualizar fechas');
  return data;
};

export const editarCard = async (
  token: string,
  cardId: string,
  data: { titulo: string; descripcion: string }
) => {
  const res = await apiFetch(`/cards/${cardId}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.msg || 'Error al editar tarjeta');
  return result;
};

export const eliminarCard = async (token: string, cardId: string) => {
  const res = await apiFetch(`/cards/${cardId}`, token, { method: 'DELETE' });
  const result = await res.json();
  if (!res.ok) throw new Error(result.msg || 'Error al eliminar tarjeta');
  return result;
};

export const toggleEstadoCompletadaCard = async (
  token: string,
  cardId: string,
  completada: boolean
) => {
  const res = await apiFetch(`/tarjetas/${cardId}/completada`, token, {
    method: 'PATCH',
    body: JSON.stringify({ completada }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al actualizar estado');
  return data;
};

export const reordenarCards = async (
  token: string,
  listaId: string,
  tarjetas: { id: string; posicion: number }[]
) => {
  const res = await apiFetch(`/listas/${listaId}/tarjetas/reordenar`, token, {
    method: 'PATCH',
    body: JSON.stringify({ tarjetas }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al reordenar tarjetas');
  return data;
};

export const moverCardALista = async (
  token: string,
  cardId: string,
  nuevaListaId: string
) => {
  const res = await apiFetch(`/tarjetas/${cardId}/mover`, token, {
    method: 'PATCH',
    body: JSON.stringify({ nuevaListaId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al mover tarjeta');
  return data;
};
