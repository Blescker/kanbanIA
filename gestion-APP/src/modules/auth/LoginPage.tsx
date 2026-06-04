import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUsuario } from '../../api/auth';
import { useMutation } from '@tanstack/react-query';

type LoginCredentials = { correo: string; password: string };
type LoginResponse = { token: string };

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: loginUsuario,
    onSuccess: (data) => login(data.token),
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <span className="text-white font-semibold text-lg">Gestión de Proyectos</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Organiza tu equipo.<br />Entrega a tiempo.
          </h1>
          <p className="text-indigo-200 text-base">
            Tableros Kanban, chat en tiempo real y planificación con IA — todo en un solo lugar.
          </p>
        </div>
        <p className="text-indigo-300 text-sm">© {new Date().getFullYear()} Gestión de Proyectos</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-semibold text-gray-800 dark:text-white">Gestión de Proyectos</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Bienvenido de nuevo</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Ingresá tu correo y contraseña para continuar</p>

          {mutation.isError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {mutation.error?.message || 'Credenciales incorrectas'}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ correo, password }); }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="nombre@empresa.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {mutation.isPending ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            ¿No tenés cuenta?{' '}
            <button onClick={() => navigate('/register')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Registrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
