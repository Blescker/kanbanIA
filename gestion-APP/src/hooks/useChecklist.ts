import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { agregarChecklistItem, actualizarChecklistItem, eliminarChecklistItem, obtenerChecklist } from '../api/checklists';
import { toggleEstadoCompletadaCard } from '../api/cards';
import { useToast } from '../context/ToastContext';

interface ChecklistItem {
  id: number;
  nombre: string;
  completado: boolean;
}

export function useChecklist(
  tareaSeleccionada: { id: string; listaId: string } | null,
  token: string | null
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [nuevoChecklist, setNuevoChecklist] = useState('');
  const [editandoItemId, setEditandoItemId] = useState<number | null>(null);
  const [nuevoNombreChecklist, setNuevoNombreChecklist] = useState('');

  const cargarChecklist = async (cardId: string) => {
    try {
      setChecklist(await obtenerChecklist(token!, cardId));
    } catch {
      console.error('Error al cargar checklist');
    }
  };

  const handleAgregarChecklist = async () => {
    if (!nuevoChecklist.trim() || !tareaSeleccionada) return;
    try {
      await agregarChecklistItem(token!, tareaSeleccionada.id, { nombre: nuevoChecklist, completado: false });
      setNuevoChecklist('');
      setChecklist(await obtenerChecklist(token!, tareaSeleccionada.id));
      queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
    } catch {
      toast.error('Error al agregar ítem de checklist');
    }
  };

  const toggleChecklistItem = async (itemId: number, completado: boolean) => {
    if (!tareaSeleccionada) return;
    try {
      const item = checklist.find((c) => c.id === itemId);
      if (!item) return;
      await actualizarChecklistItem(token!, tareaSeleccionada.id, itemId, { nombre: item.nombre, completado });
      const actualizado = await obtenerChecklist(token!, tareaSeleccionada.id);
      setChecklist(actualizado);
      queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
      const todosCompletados = actualizado.every((i: ChecklistItem) => i.completado);
      await toggleEstadoCompletadaCard(token!, tareaSeleccionada.id, todosCompletados);
      queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
    } catch {
      toast.error('Error al actualizar ítem');
    }
  };

  const eliminarItemChecklist = async (itemId: number) => {
    if (!tareaSeleccionada) return;
    try {
      await eliminarChecklistItem(token!, tareaSeleccionada.id, itemId);
      await cargarChecklist(tareaSeleccionada.id);
    } catch {
      toast.error('Error al eliminar ítem');
    }
  };

  const guardarNombreChecklist = async (itemId: number) => {
    if (!tareaSeleccionada || !nuevoNombreChecklist.trim()) return;
    try {
      const item = checklist.find((c) => c.id === itemId);
      if (!item) return;
      await actualizarChecklistItem(token!, tareaSeleccionada.id, itemId, {
        nombre: nuevoNombreChecklist,
        completado: item.completado,
      });
      setChecklist(await obtenerChecklist(token!, tareaSeleccionada.id));
      queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
      setEditandoItemId(null);
      setNuevoNombreChecklist('');
    } catch {
      toast.error('Error al actualizar nombre del ítem');
    }
  };

  return {
    checklist,
    setChecklist,
    nuevoChecklist,
    setNuevoChecklist,
    editandoItemId,
    setEditandoItemId,
    nuevoNombreChecklist,
    setNuevoNombreChecklist,
    cargarChecklist,
    handleAgregarChecklist,
    toggleChecklistItem,
    eliminarItemChecklist,
    guardarNombreChecklist,
  };
}
