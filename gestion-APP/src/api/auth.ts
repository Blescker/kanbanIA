import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/auth`;

export const registrarUsuario = async (datos: {
  nombre: string;
  correo: string;
  password: string;
}) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al registrar');
  return data;
};

export const loginUsuario = async (datos: {
  correo: string;
  password: string;
}) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al iniciar sesión');
  return data;
};
