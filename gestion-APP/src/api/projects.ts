import { API_BASE_URL } from './config';
// src/api/projects.ts
export const obtenerProyectos = async (token: string) => {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al cargar proyectos');
  return data;
};

export const crearProyecto = async (
  token: string,
  proyecto: {
    nombre: string;
    descripcion: string;
    estado: string;
    fecha: string;
  }
) => {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(proyecto),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.msg || 'Error al crear proyecto');

  // Devuelve el proyecto directamente si está anidado
  return data.proyecto || data;
};


export const obtenerProyectoPorId = async (token: string, id: string) => {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Proyecto no encontrado');
  return data;
};

export const actualizarProyecto = async (
  token: string,
  id: string,
  data: {
    nombre: string;
    descripcion: string;
    estado: string;
    fecha: string;
  }
) => {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.msg || 'Error al actualizar el proyecto');
  return result;
};

export const eliminarProyecto = async (token: string, id: string) => {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al eliminar proyecto');
  return data;
};
