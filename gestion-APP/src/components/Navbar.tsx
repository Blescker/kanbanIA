import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';

export const Navbar = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gray-800 text-white dark:bg-gray-900 dark:text-white px-4 py-3 flex items-center justify-between relative">
      {/* Botón hamburguesa SOLO en móvil */}
      <button
        className="md:hidden mr-2 p-2 rounded hover:bg-gray-700 focus:outline-none"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Título centrado en móvil, a la izquierda en desktop */}
      <h1 className="text-xl font-bold flex-1 text-center md:text-left">
        Gestión de Proyectos
      </h1>

      <div className="flex gap-4 items-center">
        <button
          onClick={toggleDarkMode}
          className="bg-gray-700 dark:bg-gray-200 dark:text-black px-4 py-2 rounded hover:opacity-90 transition"
        >
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
      </div>
    </nav>
  );
};
