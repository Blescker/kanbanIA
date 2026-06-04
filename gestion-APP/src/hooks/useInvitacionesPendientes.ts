import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
// Interfaces según tu modelo
export interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  avatar?: string;
}

export interface Proyecto {
  _id: string;
  nombre: string;
}

export type EstadoInvitacion = 'pendiente' | 'aceptada' | 'rechazada';

export interface Invitacion {
  _id: string;
  proyecto: Proyecto | string;
  usuarioInvitado: Usuario | string;
  usuarioInvitador: Usuario | string;
  estado: EstadoInvitacion;
  fechaCreacion: string;
}

// Cambia la URL si tu endpoint es diferente
const fetchInvitacionesPendientes = async (token: string): Promise<Invitacion[]> => {
  const res = await fetch(`${API_BASE_URL}/users/invitaciones`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudo obtener invitaciones');
  return res.json();
};

export const useInvitacionesPendientes = () => {
  const { token } = useAuth();

  return useQuery<Invitacion[]>({
    queryKey: ['invitaciones', token],
    queryFn: () => fetchInvitacionesPendientes(token!),
    enabled: !!token,
    select: (data) => data.filter(inv => inv.estado === 'pendiente'),
    refetchInterval: 10000, // refresca cada 10s (opcional)
  });
};
