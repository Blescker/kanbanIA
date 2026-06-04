import { useParams, useNavigate } from 'react-router-dom';
import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import { obtenerProyectoPorId, eliminarProyecto } from '../../api/projects';
import { Layout } from '../../components/Layout';
import { Sidebar } from '../../components/Sidebar';
import { API_BASE_URL } from '../../api/config';

const buscarUsuarioPorCorreo = async (token: string, correo: string) => {
  const res = await fetch(`${API_BASE_URL}/users/buscar?correo=${correo}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Usuario no encontrado');
  return res.json();
};

const enviarInvitacion = async (token: string, proyectoId: string, correo: string) => {
  const res = await fetch(`${API_BASE_URL}/projects/${proyectoId}/invitaciones`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo })
  });
  if (!res.ok) throw new Error('No se pudo enviar la invitación');
  return res.json();
};

const rolLabel: Record<string, string> = {
  propietario: 'Propietario',
  colaborador: 'Colaborador',
  lector: 'Lector',
};
const rolColor: Record<string, string> = {
  propietario: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  colaborador: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  lector:      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, usuario } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [correo, setCorreo] = useState('');
  const [sugerencia, setSugerencia] = useState<any | null>(null);
  const [loadingSugerencia, setLoadingSugerencia] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorInvitacion, setErrorInvitacion] = useState('');

  const { data: proyecto, isLoading, isError, error } = useQuery({
    queryKey: ['proyecto', id],
    queryFn: () => obtenerProyectoPorId(token!, id!),
    enabled: !!token && !!id,
  });

  const esPropietario = !!usuario && proyecto?.miembros?.some(
    (m: any) => String(m.usuario?.id) === String(usuario._id) && m.rol === 'propietario'
  );

  const eliminarMutation = useMutation({
    mutationFn: () => eliminarProyecto(token!, id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      navigate('/dashboard');
    },
    onError: (error: any) => alert(error.message || 'Error al eliminar proyecto'),
  });

  const handleBuscarUsuario = async (value: string) => {
    setCorreo(value);
    setMensaje('');
    setErrorInvitacion('');
    setSugerencia(null);
    if (value.length < 3) return;
    setLoadingSugerencia(true);
    try {
      const user = await buscarUsuarioPorCorreo(token!, value);
      setSugerencia(user);
    } catch { setSugerencia(null); }
    setLoadingSugerencia(false);
  };

  const mutation = useMutation({
    mutationFn: () => enviarInvitacion(token!, id!, correo),
    onSuccess: () => {
      setMensaje('Invitación enviada correctamente');
      setCorreo('');
      setSugerencia(null);
      queryClient.invalidateQueries({ queryKey: ['proyecto', id] });
    },
    onError: (err: any) => setErrorInvitacion(err.message || 'Error al invitar'),
  });

  if (isLoading) return (
    <Layout>
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );
  if (isError) return <p className="p-8 text-red-500">{error?.message}</p>;
  if (!proyecto) return null;

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-5">
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{proyecto.nombre}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{proyecto.descripcion}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => navigate(`/projects/${proyecto._id ?? proyecto.id}/kanban`)} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  Tablero
                </button>
                <button onClick={() => navigate(`/projects/${proyecto._id ?? proyecto.id}/chat`)} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  Chat
                </button>
                {esPropietario && (
                  <>
                    <button onClick={() => navigate(`/projects/${proyecto._id ?? proyecto.id}/edit`)} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      Editar
                    </button>
                    <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                      Invitar
                    </button>
                    <button onClick={() => confirm('¿Eliminar este proyecto?') && eliminarMutation.mutate()} disabled={eliminarMutation.isPending} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      {eliminarMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Miembros */}
          <div className="px-8 py-8 max-w-4xl">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Miembros del proyecto</h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              {proyecto.miembros?.map((m: any, idx: number) => (
                <div key={m.usuario?.id ?? idx} className={`flex items-center gap-3 px-5 py-3.5 ${idx < proyecto.miembros.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                  <img
                    src={m.usuario?.avatar?.trim() ? m.usuario.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(m.usuario?.nombre || 'U')}&background=6366f1&color=fff`}
                    alt={m.usuario?.nombre}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{m.usuario?.nombre || 'Usuario'}</p>
                    <p className="text-xs text-gray-400 truncate">{m.usuario?.correo}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${rolColor[m.rol] || rolColor.lector}`}>
                    {rolLabel[m.rol] || m.rol}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal invitar */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowModal(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
                <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white mb-1">Invitar al proyecto</Dialog.Title>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Ingresá el correo del usuario que querés invitar</p>
                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-3">
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={correo}
                    onChange={(e) => handleBuscarUsuario(e.target.value)}
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {loadingSugerencia && <p className="text-xs text-gray-400">Buscando...</p>}
                  {sugerencia && (
                    <div onClick={() => setCorreo(sugerencia.correo)} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(sugerencia.nombre)}&background=6366f1&color=fff`} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{sugerencia.nombre}</p>
                        <p className="text-xs text-gray-400">{sugerencia.correo}</p>
                      </div>
                    </div>
                  )}
                  {mensaje && <p className="text-sm text-emerald-600 dark:text-emerald-400">{mensaje}</p>}
                  {errorInvitacion && <p className="text-sm text-red-600 dark:text-red-400">{errorInvitacion}</p>}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancelar</button>
                    <button type="submit" disabled={mutation.isPending || !correo} className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50">
                      {mutation.isPending ? 'Enviando...' : 'Invitar'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </Layout>
  );
};
