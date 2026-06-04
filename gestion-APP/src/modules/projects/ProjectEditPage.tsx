import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerProyectoPorId, actualizarProyecto } from '../../api/projects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../../components/Layout';
import { Sidebar } from '../../components/Sidebar';

interface Proyecto { _id: string; nombre: string; descripcion: string; estado: string; fecha: string }
type ProyectoForm = { nombre: string; descripcion: string; estado: string; fecha: string };

const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

export const ProjectEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProyectoForm>({ nombre: '', descripcion: '', estado: '', fecha: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: proyecto, isLoading, isError, error } = useQuery<Proyecto, Error>({
    queryKey: ['proyecto', id],
    queryFn: () => obtenerProyectoPorId(token!, id!),
    enabled: !!token && !!id,
  });

  useEffect(() => {
    if (proyecto) setForm({ nombre: proyecto.nombre, descripcion: proyecto.descripcion, estado: proyecto.estado, fecha: proyecto.fecha });
  }, [proyecto]);

  const mutation = useMutation({
    mutationFn: (data: ProyectoForm) => actualizarProyecto(token!, id!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['proyecto', id] }); navigate(`/projects/${id}`); },
    onError: (error: any) => setLocalError(error.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  if (isLoading) return (
    <Layout>
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );
  if (isError) return <p className="p-8 text-red-500">{error?.message}</p>;

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-5">
            <button onClick={() => navigate(`/projects/${id}`)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar proyecto</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{proyecto?.nombre}</p>
          </div>

          <div className="px-8 py-8 max-w-xl">
            {localError && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {localError}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); if (!form.nombre || !form.descripcion) { setLocalError('Todos los campos son obligatorios'); return; } mutation.mutate(form); }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
              <div>
                <label className={labelClass}>Nombre del proyecto</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange} className={inputClass}>
                  <option value="">Seleccioná un estado</option>
                  <option value="Planeado">Planeado</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => navigate(`/projects/${id}`)} className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={mutation.isPending} className="px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50">
                  {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
};
