import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../api/config';
// --- Interfaces ---
export interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  avatar?: string;
}

export interface Proyecto {
  _id: string;
  nombre: string;
  descripcion?: string;
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

// --- API helpers ---
const fetchProyectos = async (token: string): Promise<Proyecto[]> => {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener proyectos');
  return res.json();
};

const fetchInvitacionesPendientes = async (token: string): Promise<Invitacion[]> => {
  const res = await fetch(`${API_BASE_URL}/users/invitaciones`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudo obtener invitaciones');
  return res.json();
};

const aceptarInvitacion = async (token: string, id: string) => {
  const res = await fetch(`${API_BASE_URL}/users/invitaciones/${id}/aceptar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudo aceptar la invitación');
  return res.json();
};

const rechazarInvitacion = async (token: string, id: string) => {
  const res = await fetch(`${API_BASE_URL}/users/invitaciones/${id}/rechazar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudo rechazar la invitación');
  return res.json();
};

export const Sidebar: React.FC = () => {
  const { logout, token } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [openProjects, setOpenProjects] = useState(true);
  const [openInvitaciones, setOpenInvitaciones] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Responsive
  const queryClient = useQueryClient();

  // Proyectos del usuario
  const { data: proyectos = [], isLoading: loadingProyectos } = useQuery<Proyecto[]>({
    queryKey: ['proyectos', token],
    queryFn: () => fetchProyectos(token!),
    enabled: !!token,
  });

  // Invitaciones pendientes
  const { data: invitaciones = [], isLoading: loadingInvitaciones } = useQuery<Invitacion[]>({
    queryKey: ['invitaciones', token],
    queryFn: () => fetchInvitacionesPendientes(token!),
    enabled: !!token,
    select: (data) => data.filter(inv => inv.estado === 'pendiente'),
    refetchInterval: 10000,
  });

  // Mutations
  const aceptarMutation = useMutation({
    mutationFn: (id: string) => aceptarInvitacion(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones', token] });
      queryClient.invalidateQueries({ queryKey: ['proyectos', token] });
    }
  });

  const rechazarMutation = useMutation({
    mutationFn: (id: string) => rechazarInvitacion(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones', token] });
    }
  });

  // --- Sidebar content (drawer/fixed) ---
  const SidebarContent = (
    <div className="flex flex-col h-screen w-64 bg-white border-r dark:bg-gray-900 dark:border-gray-700">
      <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)} className="px-5 pt-6 pb-2 flex items-center gap-3">
        <img className="h-9 w-auto flex-shrink-0" src="/logo.png" alt="Logo" />
        <span className="font-bold text-sm leading-tight text-gray-800 dark:text-white">
          Gestión de<br />Proyectos
        </span>
      </NavLink>

      {/* SOLO el menú es scrollable */}
      <div className="flex-1 flex flex-col mt-6 overflow-y-auto px-5 pb-4">
        <nav className="-mx-3 space-y-3">
          {/* Home */}
          <NavLink
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 ${
                isActive ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : ''
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="mx-2 text-sm font-medium">Inicio</span>
          </NavLink>

          {/* Tus Proyectos */}
          <button
            onClick={() => setOpenProjects((v) => !v)}
            className="flex items-center w-full px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
            <span className="mx-2 text-sm font-medium">Mis Proyectos</span>
            <svg className={`w-4 h-4 ml-auto transform transition-transform ${openProjects ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {openProjects && (
            <div className="ml-8 mt-1 space-y-1 max-h-48 overflow-y-auto">
              {loadingProyectos ? (
                <span className="block px-2 py-1 text-xs text-gray-400">Cargando...</span>
              ) : proyectos.length === 0 ? (
                <span className="block px-2 py-1 text-xs text-gray-400">Sin proyectos</span>
              ) : (
                proyectos.map((proyecto) => (
                  <NavLink
                    key={proyecto._id}
                    to={`/projects/${proyecto._id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `block px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        isActive ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : 'text-gray-600 dark:text-gray-300'
                      }`
                    }
                  >
                    {proyecto.nombre}
                  </NavLink>
                ))
              )}
            </div>
          )}

          {/* Nuevo Proyecto */}
          <NavLink
            to="/projects/new"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center px-3 py-2 mt-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="mx-2 text-sm font-medium">Nuevo proyecto</span>
          </NavLink>

          {/* Invitaciones (submenu con aceptar/rechazar) */}
          <button
            onClick={() => setOpenInvitaciones((v) => !v)}
            className="flex items-center w-full px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
            </svg>
            <span className="mx-2 text-sm font-medium">Invitación a proyectos</span>
            {!loadingInvitaciones && invitaciones.length > 0 && (
              <span className="ml-2 bg-red-500 text-xs rounded-full px-2">
                {invitaciones.length}
              </span>
            )}
            <svg className={`w-4 h-4 ml-auto transform transition-transform ${openInvitaciones ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {openInvitaciones && (
            <div className="ml-8 mt-1 space-y-2 max-h-64 overflow-y-auto">
              {loadingInvitaciones ? (
                <span className="block px-2 py-1 text-xs text-gray-400">Cargando...</span>
              ) : invitaciones.length === 0 ? (
                <span className="block px-2 py-1 text-xs text-gray-400">Sin invitaciones</span>
              ) : (
                invitaciones.map((inv) => {
                  const proyecto = typeof inv.proyecto === 'object' && inv.proyecto !== null
                    ? inv.proyecto as Proyecto
                    : null;
                  return (
                    <div key={inv._id} className="flex flex-col mb-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <span className="font-medium text-sm">{proyecto ? proyecto.nombre : 'Proyecto'}</span>
                      <div className="flex gap-2 mt-1">
                        <button
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                          onClick={() => aceptarMutation.mutate(inv._id)}
                          disabled={aceptarMutation.isPending}
                        >
                          Aceptar
                        </button>
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                          onClick={() => rechazarMutation.mutate(inv._id)}
                          disabled={rechazarMutation.isPending}
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Perfil */}
          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 ${
                isActive ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : ''
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span className="mx-2 text-sm font-medium">Perfil</span>
          </NavLink>
        </nav>
      </div>

      {/* Acciones inferiores */}
      <div className="px-5 pt-3 pb-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-1">
        {/* Toggle tema */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          {isDark ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              Modo claro
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
              Modo oscuro
            </>
          )}
        </button>

        {/* Cerrar sesión */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón hamburguesa visible solo en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Drawer overlay con blur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar drawer en móvil, fijo en desktop */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300
          md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          w-64
        `}
      >
        {SidebarContent}
      </aside>
    </>
  );
};
