import { API_BASE_URL } from '../api/config';
// Usuario
export interface Usuario {
  _id: string;
  nombre: string;
  apellido?: string;
  correo: string;
  avatar?: string;
}

// Proyecto
export interface MiembroProyecto {
  usuario: Usuario | string;
  rol: 'propietario' | 'colaborador' | 'lector';
}

export interface Proyecto {
  _id: string;
  nombre: string;
  descripcion?: string;
  fecha_creacion: string;
  creador: Usuario | string;
  miembros: MiembroProyecto[];
  createdAt: string;
  updatedAt: string;
}

// Invitacion
export type EstadoInvitacion = 'pendiente' | 'aceptada' | 'rechazada';

export interface Invitacion {
  _id: string;
  proyecto: Proyecto | string;
  usuarioInvitado: Usuario | string;
  usuarioInvitador: Usuario | string;
  estado: EstadoInvitacion;
  fechaCreacion: string;
}

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export const useProyectos = () => {
  const { token } = useAuth();
  return useQuery<Proyecto[]>({
    queryKey: ['proyectos', token],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener proyectos');
      return res.json();
    },
    enabled: !!token,
  });
};

