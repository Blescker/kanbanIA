import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editarLista, eliminarLista } from '../api/lists';

// Tipos para los parámetros de cada mutación
type EditarListaParams = {
  token: string;
  listaId: string;
  nombre: string;
};

type EliminarListaParams = {
  token: string;
  listaId: string;
};

export function useEditarLista() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, listaId, nombre }: EditarListaParams) =>
      editarLista(token, listaId, nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listas'] });
    },
  });
}

export function useEliminarLista() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, listaId }: EliminarListaParams) =>
      eliminarLista(token, listaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listas'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}
