import { API_BASE_URL } from '../api/config';
// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  usuario: Usuario | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  refreshUsuario: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchPerfil(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
      window.location.href = '/login';
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const fetchPerfil = async (jwt: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsuario(data);
        setToken(jwt);
        localStorage.setItem('token', jwt);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (jwt: string) => {
    fetchPerfil(jwt); // también guarda token
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
  };

  const refreshUsuario = () => {
    if (token) fetchPerfil(token);
  };

  const value: AuthContextType = {
    isAuthenticated: !!token,
    usuario,
    token,
    login,
    logout,
    refreshUsuario,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
