import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Usuario, obtenerPerfil, actualizarPerfil, actualizarAvatar, cambiarPassword } from '../../api/usuario';
import { Layout } from '../../components/Layout';
import { Sidebar } from '../../components/Sidebar';

const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

export const ProfilePage = () => {
  const { token, refreshUsuario } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Usuario>({ id: '', nombre: '', apellido: '', correo: '', avatar: '' });
  const [editando, setEditando] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');

  const { data: usuario, refetch, isLoading } = useQuery<Usuario>({
    queryKey: ['perfil', token],
    queryFn: () => obtenerPerfil(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (usuario) { setForm(usuario); setAvatarPreview(null); }
  }, [usuario]);

  const mutationPerfil = useMutation({
    mutationFn: () => actualizarPerfil(token!, { nombre: form.nombre, apellido: form.apellido }),
    onSuccess: (data) => { setMensaje(data.msg); setEditando(false); refetch(); refreshUsuario(); },
    onError: (err: any) => setError(err.message || 'Error al actualizar perfil'),
  });

  const mutationAvatar = useMutation({
    mutationFn: () => actualizarAvatar(token!, form.avatar!),
    onSuccess: (data) => { setMensaje(data.msg); setAvatarPreview(null); refetch(); refreshUsuario(); },
    onError: (err: any) => setError(err.message || 'Error al actualizar avatar'),
  });

  const mutationPassword = useMutation({
    mutationFn: () => cambiarPassword(token!, passwordActual, nuevaPassword),
    onSuccess: (data) => { setMensaje(data.msg); setPasswordActual(''); setNuevaPassword(''); setMostrarPassword(false); },
    onError: (err: any) => setError(err.message || 'Error al cambiar contraseña'),
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagen = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, avatar: result }));
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    mutationPerfil.mutate();
    if (form.avatar && form.avatar !== usuario?.avatar) mutationAvatar.mutate();
  };

  const avatarSrc = avatarPreview || form.avatar || usuario?.avatar || '';
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nombre || usuario?.nombre || 'U')}&background=6366f1&color=fff&size=128`;

  if (isLoading) return (
    <Layout>
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi perfil</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestioná tu información personal</p>
          </div>

          <div className="px-8 py-8 max-w-2xl space-y-6">
            {mensaje && <div className="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">{mensaje}</div>}
            {error && <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">{error}</div>}

            {/* Card de perfil */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              {/* Avatar */}
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="relative group">
                  <img
                    src={avatarSrc || avatarFallback}
                    onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback; }}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                  {editando && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagen} className="hidden" />
                  {avatarPreview && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{usuario?.nombre} {usuario?.apellido}</p>
                  <p className="text-sm text-gray-400">{usuario?.correo}</p>
                  {editando && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                      Cambiar foto
                    </button>
                  )}
                </div>
              </div>

              {editando ? (
                <form onSubmit={handleGuardar} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nombre</label>
                      <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Apellido</label>
                      <input type="text" name="apellido" value={form.apellido} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Correo</label>
                    <input type="email" value={form.correo} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50" disabled={mutationPerfil.isPending || mutationAvatar.isPending}>
                      {mutationPerfil.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button type="button" onClick={() => { if (usuario) setForm(usuario); setAvatarPreview(null); setEditando(false); }} className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Nombre</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{usuario?.nombre || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Apellido</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{usuario?.apellido || '—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Correo</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{usuario?.correo}</p>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <button onClick={() => { if (usuario) setForm(usuario); setEditando(true); }} className="px-4 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition">
                      Editar perfil
                    </button>
                    <button onClick={() => setMostrarPassword(true)} className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      Cambiar contraseña
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cambio de contraseña */}
            {mostrarPassword && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Cambiar contraseña</h2>
                <form onSubmit={(e) => { e.preventDefault(); setError(''); setMensaje(''); mutationPassword.mutate(); }} className="space-y-4">
                  <div>
                    <label className={labelClass}>Contraseña actual</label>
                    <input type="password" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} className={inputClass} required placeholder="••••••••" />
                  </div>
                  <div>
                    <label className={labelClass}>Nueva contraseña</label>
                    <input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} className={inputClass} required minLength={6} placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50" disabled={mutationPassword.isPending}>
                      {mutationPassword.isPending ? 'Actualizando...' : 'Actualizar'}
                    </button>
                    <button type="button" onClick={() => setMostrarPassword(false)} className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};
