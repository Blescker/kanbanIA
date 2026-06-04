import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../../components/Layout';
import { Sidebar } from '../../components/Sidebar';
import { Breadcrumb } from '../../components/Breadcrumb';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
import { API_BASE_URL } from '../../api/config';

interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  avatar?: string;
}
interface Mensaje {
  _id: string;
  contenido: string;
  createdAt: string;
  usuario: Usuario;
}

const Avatar = ({ user, size = 'md' }: { user: Usuario; size?: 'sm' | 'md' }) => {
  const src = user.avatar?.trim()
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=6366f1&color=fff`;
  const cls = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  return <img src={src} alt={user.nombre} className={`${cls} rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-gray-800`} />;
};

const formatHora = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ProjectChatPage = () => {
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [miembros, setMiembros] = useState<Usuario[]>([]);
  const [conectados, setConectados] = useState<string[]>([]);
  const { id: proyectoId } = useParams<{ id: string }>();
  const { usuario, token } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [usuariosEscribiendo, setUsuariosEscribiendo] = useState<string[]>([]);
  const escribiendoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [escribiendo, setEscribiendo] = useState(false);

  useEffect(() => {
    const fetchProyecto = async () => {
      const res = await fetch(`${API_BASE_URL}/projects/${proyectoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNombreProyecto(data.nombre);
      // Normalizar _id para que coincida con los IDs del socket
      setMiembros(data.miembros.map((m: any) => ({
        ...m.usuario,
        _id: String(m.usuario.id ?? m.usuario._id),
      })));
    };
    if (proyectoId && token) fetchProyecto();
  }, [proyectoId, token]);

  useEffect(() => {
    const fetchMensajes = async () => {
      const res = await fetch(`${API_BASE_URL}/messages/${proyectoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMensajes(data.map((m: any) => ({
        ...m,
        _id: String(m._id ?? m.id),
        usuario: { ...m.usuario, _id: String(m.usuario._id ?? m.usuario.id) },
      })));
    };
    if (proyectoId && token) fetchMensajes();
  }, [proyectoId, token]);

  useEffect(() => {
    if (!proyectoId || !usuario) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('joinRoom', { proyectoId, userId: String(usuario._id) });
    socket.on('chat:nuevoMensaje', (msg: Mensaje) => setMensajes(prev => [...prev, msg]));
    socket.on('usuarios:conectados', (ids: string[]) => setConectados(ids));
    socket.on('usuario:escribiendo', ({ userId }) => {
      setUsuariosEscribiendo(prev =>
        !prev.includes(userId) && userId !== usuario!._id ? [...prev, userId] : prev
      );
    });
    socket.on('usuario:dejoDeEscribir', ({ userId }) =>
      setUsuariosEscribiendo(prev => prev.filter(id => id !== userId))
    );
    return () => { socket.disconnect(); };
  }, [proyectoId, usuario]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [nuevoMensaje]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNuevoMensaje(e.target.value);
    if (!socketRef.current || !proyectoId || !usuario) return;
    if (!escribiendo) {
      setEscribiendo(true);
      socketRef.current.emit('typing', { proyectoId, userId: usuario._id });
    }
    if (escribiendoTimeoutRef.current) clearTimeout(escribiendoTimeoutRef.current);
    escribiendoTimeoutRef.current = setTimeout(() => {
      setEscribiendo(false);
      socketRef.current?.emit('stopTyping', { proyectoId, userId: usuario._id });
    }, 1000);
  };

  const handleEnviar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const contenido = nuevoMensaje.trim();
    if (!contenido || !usuario) return;
    socketRef.current?.emit('chat:mensaje', { proyectoId, contenido, usuarioId: usuario._id });
    setNuevoMensaje('');
    setEscribiendo(false);
    socketRef.current?.emit('stopTyping', { proyectoId, userId: usuario._id });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); }
  };

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <Sidebar />

        {/* Contenedor principal */}
        <div className="flex flex-1 overflow-hidden">

          {/* Panel de miembros */}
          <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-base text-gray-800 dark:text-white">Miembros</h2>
              <p className="text-xs text-gray-400 mt-0.5">{conectados.length} conectado{conectados.length !== 1 ? 's' : ''}</p>
            </div>
            <ul className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {miembros.map((user) => {
                const online = conectados.map(String).includes(String(user._id));
                return (
                  <li key={user._id} className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar user={user} size="md" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{user.nombre}</p>
                      <p className={`text-xs ${online ? 'text-green-500' : 'text-gray-400'}`}>{online ? 'En línea' : 'Desconectado'}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Chat principal */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Header */}
            <header className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <Breadcrumb items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: nombreProyecto || '...', href: `/projects/${proyectoId}` },
                { label: 'Chat' },
              ]} />
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-lg text-gray-900 dark:text-white truncate">{nombreProyecto}</h1>
                {/* Miembros online en mobile */}
                <div className="flex -space-x-2 lg:hidden">
                  {miembros.slice(0, 4).map(u => (
                    <Avatar key={u._id} user={u} size="sm" />
                  ))}
                </div>
              </div>
            </header>

            {/* Área de mensajes */}
            <div
              className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5
                bg-[linear-gradient(rgba(249,250,251,0.88),rgba(249,250,251,0.88)),url('/imgfondochat.png')]
                dark:bg-[linear-gradient(rgba(3,7,18,0.88),rgba(3,7,18,0.88)),url('/imgfondochat.png')]
                bg-cover bg-center bg-no-repeat"
            >
              <AnimatePresence initial={false}>
                {mensajes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <span className="text-5xl mb-4">💬</span>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Nadie ha escrito todavía.<br />¡Sé el primero!</p>
                  </div>
                ) : (
                  mensajes.map((msg) => {
                    const esMio = String(msg.usuario._id) === String(usuario!._id);
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-end gap-2.5 ${esMio ? 'justify-end' : 'justify-start'}`}
                      >
                        {!esMio && <Avatar user={msg.usuario} size="sm" />}

                        <div className={`flex flex-col ${esMio ? 'items-end' : 'items-start'} max-w-[65%] sm:max-w-[55%]`}>
                          {!esMio && (
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1">
                              {msg.usuario.nombre}
                            </span>
                          )}
                          <div
                            className={`px-4 py-2.5 shadow-sm text-sm leading-relaxed break-words
                              ${esMio
                                ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700'
                              }`}
                          >
                            {msg.contenido}
                          </div>
                          <span className="text-[11px] text-gray-400 mt-1 mx-1">
                            {formatHora(msg.createdAt)}
                          </span>
                        </div>

                        {esMio && <Avatar user={msg.usuario} size="sm" />}
                      </motion.div>
                    );
                  })
                )}

                {usuariosEscribiendo.length > 0 && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {miembros.find(u => u._id === usuariosEscribiendo[0])?.nombre || 'Alguien'} escribe...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleEnviar}
              className="flex items-end gap-3 px-4 sm:px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            >
              <Avatar user={usuario!} size="sm" />
              <div className="flex-1 flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5">
                <textarea
                  ref={textareaRef}
                  value={nuevoMensaje}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
                  className="flex-1 bg-transparent resize-none focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 max-h-28 leading-relaxed"
                  rows={1}
                />
              </div>
              <button
                type="submit"
                disabled={!nuevoMensaje.trim()}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition shadow"
              >
                <svg className="w-4 h-4 rotate-45" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>

          </div>
        </div>
      </div>
    </Layout>
  );
};
