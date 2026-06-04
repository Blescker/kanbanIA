import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { obtenerEtiquetas, agregarEtiqueta, eliminarEtiqueta } from '../api/etiquetas';
import { useToast } from '../context/ToastContext';

interface Etiqueta {
  id: number;
  nombre: string;
  color: string;
}

export function useEtiquetas(
  tareaSeleccionada: { id: string; listaId: string } | null,
  token: string | null
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState({ nombre: '', color: '#000000' });

  const cargarEtiquetas = async (cardId: string) => {
    try {
      setEtiquetas(await obtenerEtiquetas(token!, cardId));
    } catch {
      console.error('Error al obtener etiquetas');
    }
  };

  const handleAgregarEtiqueta = async () => {
    if (!nuevaEtiqueta.nombre.trim() || !tareaSeleccionada) return;
    try {
      await agregarEtiqueta(token!, tareaSeleccionada.id, nuevaEtiqueta);
      setNuevaEtiqueta({ nombre: '', color: '#000000' });
      setEtiquetas(await obtenerEtiquetas(token!, tareaSeleccionada.id));
      queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
    } catch {
      toast.error('Error al agregar etiqueta');
    }
  };

  const handleEliminarEtiqueta = async (itemId: number) => {
    if (!tareaSeleccionada) return;
    try {
      await eliminarEtiqueta(token!, tareaSeleccionada.id, itemId);
      setEtiquetas(await obtenerEtiquetas(token!, tareaSeleccionada.id));
      queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
    } catch {
      toast.error('Error al eliminar etiqueta');
    }
  };

  return {
    etiquetas,
    nuevaEtiqueta,
    setNuevaEtiqueta,
    cargarEtiquetas,
    handleAgregarEtiqueta,
    handleEliminarEtiqueta,
  };
}
