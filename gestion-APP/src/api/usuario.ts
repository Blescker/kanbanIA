import { API_BASE_URL } from './config';

export interface Usuario {
  id: string;
  nombre: string;
  apellido?: string;
  correo: string;
  avatar?: string;
}
export const obtenerPerfil = async (token: string): Promise<Usuario> => {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudo obtener el perfil');
  return res.json();
};

export const actualizarPerfil = async (
  token: string,
  data: { nombre: string; apellido?: string }
): Promise<{ msg: string; usuario: Usuario }> => {
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('No se pudo actualizar el perfil');
  return res.json();
};

export const actualizarAvatar = async (
  token: string,
  avatar: string
): Promise<{ msg: string; usuario: Usuario }> => {
  const res = await fetch(`${API_BASE_URL}/users/avatar`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ avatar })
  });
  if (!res.ok) throw new Error('No se pudo actualizar el avatar');
  return res.json();
};

export const cambiarPassword = async (
  token: string,
  passwordActual: string,
  nuevaPassword: string
): Promise<{ msg: string }> => {
  const res = await fetch(`${API_BASE_URL}/users/password`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ passwordActual, nuevaPassword })
  });
  if (!res.ok) throw new Error('No se pudo cambiar la contraseña');
  return res.json();
};
