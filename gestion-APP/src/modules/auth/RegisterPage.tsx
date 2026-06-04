import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registrarUsuario } from '../../api/auth';
import { useMutation } from '@tanstack/react-query';

type RegisterData = { nombre: string; correo: string; password: string };
type RegisterResponse = { msg: string };

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', confirmPassword: '', captcha: false });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const mutation = useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: registrarUsuario,
    onSuccess: (data) => {
      setLocalError(null);
      setSuccessMessage(data.msg);
      setTimeout(() => navigate('/login'), 1500);
    },
    onError: (error) => setLocalError(error.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setLocalError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre, correo, password, confirmPassword, captcha } = form;
    if (!nombre || !correo || !password || !confirmPassword) return setLocalError('Todos los campos son obligatorios');
    if (password.length < 6) return setLocalError('La contraseña debe tener al menos 6 caracteres');
    if (password !== confirmPassword) return setLocalError('Las contraseñas no coinciden');
    if (!captcha) return setLocalError('Confirmá que no sos un robot');
    mutation.mutate({ nombre, correo, password });
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <span className="text-white font-semibold text-lg">Gestión de Proyectos</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Empieza hoy.<br />Sin complicaciones.
          </h1>
          <p className="text-indigo-200 text-base">Creá tu cuenta gratuita y empezá a gestionar proyectos en minutos.</p>
        </div>
        <p className="text-indigo-300 text-sm">© {new Date().getFullYear()} Gestión de Proyectos</p>
      </div>

      {/* Panel derecho */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-semibold text-gray-800 dark:text-white">Gestión de Proyectos</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Crear cuenta</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Completá los datos para registrarte</p>

          {(localError || mutation.isError) && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {localError || mutation.error?.message}
            </div>
          )}
          {successMessage && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Nombre</label>
              <input type="text" name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Correo electrónico</label>
              <input type="email" name="correo" placeholder="nombre@empresa.com" value={form.correo} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Contraseña</label>
              <input type="password" name="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Confirmar contraseña</label>
              <input type="password" name="confirmPassword" placeholder="Repetí la contraseña" value={form.confirmPassword} onChange={handleChange} className={inputClass} required />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" name="captcha" checked={form.captcha} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              No soy un robot
            </label>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {mutation.isPending ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            ¿Ya tenés cuenta?{' '}
            <button onClick={() => navigate('/login')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Iniciá sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
