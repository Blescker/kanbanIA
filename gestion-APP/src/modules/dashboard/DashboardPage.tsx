import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { obtenerProyectos } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../../components/Sidebar';

interface Proyecto {
  _id: string | number;
  id?: string | number;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

const estadoBadge: Record<string, string> = {
  'Planeado':    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'En progreso': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Finalizado':  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard = ({ label, value, icon, color, loading }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      {loading ? (
        <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario, token } = useAuth();

  const { data: proyectos = [], isLoading, isError, error } = useQuery<Proyecto[], Error>({
    queryKey: ['proyectos', token],
    queryFn: () => obtenerProyectos(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const total      = proyectos.length;
  const enProgreso = proyectos.filter(p => p.estado === 'En progreso').length;
  const finalizados = proyectos.filter(p => p.estado === 'Finalizado').length;
  const planeados  = proyectos.filter(p => p.estado === 'Planeado').length;

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hola, {usuario?.nombre}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Aquí está el resumen de tus proyectos
            </p>
          </div>

          <div className="px-8 py-8 max-w-6xl">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total"
                value={total}
                loading={isLoading}
                color="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                }
              />
              <StatCard
                label="En progreso"
                value={enProgreso}
                loading={isLoading}
                color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                }
              />
              <StatCard
                label="Finalizados"
                value={finalizados}
                loading={isLoading}
                color="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Planeados"
                value={planeados}
                loading={isLoading}
                color="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                }
              />
            </div>

            {/* Acciones rápidas */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => navigate('/projects/new')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nuevo proyecto
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Mi perfil
              </button>
            </div>

            {/* Proyectos */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Proyectos recientes</h2>
              <span className="text-sm text-gray-400">{proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map(i => (
                  <div key={i} className="h-36 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-sm text-red-500 dark:text-red-400">{error.message}</div>
            ) : proyectos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No tenés proyectos todavía</p>
                <button onClick={() => navigate('/projects/new')} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  Crear el primero
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {proyectos.map((proyecto) => {
                  const pid = String(proyecto._id ?? proyecto.id);
                  return (
                    <div
                      key={pid}
                      onClick={() => navigate(`/projects/${pid}`)}
                      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">
                          {proyecto.nombre}
                        </h3>
                        {proyecto.estado && (
                          <span className={`ml-2 flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${estadoBadge[proyecto.estado] || 'bg-gray-100 text-gray-600'}`}>
                            {proyecto.estado}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {proyecto.descripcion || 'Sin descripción'}
                      </p>
                      {proyecto.fecha && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {new Date(proyecto.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};
