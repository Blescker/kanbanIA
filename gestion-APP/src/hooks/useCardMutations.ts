import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editarCard, eliminarCard } from '../api/cards';

// Tipos para los parámetros de cada mutación
type EditarCardParams = {
  token: string;
  cardId: string;
  titulo: string;
  descripcion: string;
};

type EliminarCardParams = {
  token: string;
  cardId: string;
};

export function useEditarCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, cardId, titulo, descripcion }: EditarCardParams) =>
      editarCard(token, cardId, { titulo, descripcion }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useEliminarCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, cardId }: EliminarCardParams) =>
      eliminarCard(token, cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}
