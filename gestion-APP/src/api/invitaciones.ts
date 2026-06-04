// Buscar usuario por correo
import { API_BASE_URL } from './config';
export const buscarUsuarioPorCorreo = async (token: string, correo: string) => {
  const res = await fetch(`${API_BASE_URL}/users/buscar?correo=${correo}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Usuario no encontrado');
  return res.json();
};

// Enviar invitación
export const enviarInvitacion = async (token: string, proyectoId: string, correo: string) => {
  const res = await fetch(`${API_BASE_URL}/projects/${proyectoId}/invitaciones`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ correo })
  });
  if (!res.ok) throw new Error('No se pudo enviar la invitación');
  return res.json();
};
