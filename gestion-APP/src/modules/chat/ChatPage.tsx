import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Si tienes contexto de auth
import { API_BASE_URL } from '../../api/config';
import { Layout } from '../../components/Layout';
interface Proyecto {
  _id: string;
  nombre: string;
  descripcion: string;
}

export const ChatPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Si usas contexto de autenticación
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar proyectos');
        return res.json();
      })
      .then(data => {
        setProyectos(data);
        setLoading(false);
        setError('');
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-300 py-8 px-2 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-6 text-sm font-semibold flex items-center gap-1"
          >
            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Volver al dashboard
          </button>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
              💬 Chats por Proyecto
            </h1>

            {loading ? (
              <div className="flex justify-center items-center min-h-[120px]">
                <svg className="animate-spin h-8 w-8 text-purple-500 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span className="text-gray-500 dark:text-gray-400">Cargando proyectos...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 dark:text-red-400">{error}</div>
            ) : proyectos.length === 0 ? (
              <div className="text-center text-gray-600 dark:text-gray-400">No hay proyectos registrados.</div>
            ) : (
              <ul className="space-y-5">
                {proyectos.map((proyecto) => (
                  <li
                    key={proyecto._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{proyecto.nombre}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{proyecto.descripcion}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/projects/${proyecto._id}/chat`)}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-400 text-white px-5 py-2 rounded-lg font-medium transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8a9 9 0 100-18 9 9 0 000 18z" /></svg>
                      Ir al chat
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
