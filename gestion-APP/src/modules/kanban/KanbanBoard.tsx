import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PlanificadorIA from "../../components/PlanificadorIA";
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/Breadcrumb';
import { obtenerProyectoPorId } from '../../api/projects';
import { useEditarCard, useEliminarCard } from '../../hooks/useCardMutations';
import { useEditarLista, useEliminarLista } from '../../hooks/useListMutations';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useAuth } from '../../context/AuthContext';
import { obtenerListasPorProyecto, crearLista } from '../../api/lists';
import {
  obtenerCardsPorLista,
  crearCardEnLista,
  actualizarFechasCard,
  obtenerCardPorId,
  toggleEstadoCompletadaCard,
  reordenarCards,
  moverCardALista,
} from '../../api/cards';
import { useChecklist } from '../../hooks/useChecklist';
import { useEtiquetas } from '../../hooks/useEtiquetas';
import { Layout } from '../../components/Layout';
import { Sidebar } from '../../components/Sidebar';
import { ModalDetalleTarea } from "./components/ModalDetalleTarea";
import { ListaKanban } from './components/ListaKanban';
import { FormularioNuevaLista } from './components/FormularioNuevaLista';
import { BotonPlanificadorIA } from './components/BotonPlanificadorIA';

interface ChecklistItem {
  id: number;
  nombre: string;
  completado: boolean;
}

interface Lista {
  _id: string;
  nombre: string;
  posicion: number;
}

interface Etiqueta {
  id: number;
  nombre: string;
  color: string;
}

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  completada?: boolean;
  listaId: string;
  fechaInicio?: string;
  fechaFin?: string;
  checklist?: ChecklistItem[];
  etiquetas?: Etiqueta[];
}

export const KanbanBoard = () => {
  const { toast } = useToast();
  const { mutate: editarListaMutate } = useEditarLista();
  const { mutate: eliminarListaMutate } = useEliminarLista();
  const [editandoListaId, setEditandoListaId] = useState<string | null>(null);
  const [nuevoNombreLista, setNuevoNombreLista] = useState<string>('');

  const { id } = useParams();
  const { token } = useAuth();

  const [nuevaLista, setNuevaLista] = useState('');
  const [nuevaTarea, setNuevaTarea] = useState<Record<string, { titulo: string; descripcion: string }>>({});
  const [mostrarFormulario, setMostrarFormulario] = useState<Record<string, boolean>>({});
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [editandoCard, setEditandoCard] = useState(false);
  const [guardandoCard, setGuardandoCard] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [listaAEliminar, setListaAEliminar] = useState<string | null>(null);
  const [mostrarIA, setMostrarIA] = useState(false);

  const { mutate: editarCardMutate } = useEditarCard();
  const { mutate: eliminarCardMutate } = useEliminarCard();

  const checklistHook = useChecklist(tareaSeleccionada, token);
  const etiquetasHook = useEtiquetas(tareaSeleccionada, token);

  const obtenerProgresoChecklist = (checklist?: ChecklistItem[]) => {
    if (!checklist || checklist.length === 0) return null;
    const completados = checklist.filter((item) => item.completado).length;
    return `${completados}/${checklist.length}`;
  };

  const queryClient = useQueryClient();

  const abrirDetalleTarea = async (tarea: Tarea) => {
    setTareaSeleccionada(tarea);
    checklistHook.cargarChecklist(tarea.id);
    etiquetasHook.cargarEtiquetas(tarea.id);
  };

  const toggleCompletada = async (tareaId: string, completada: boolean) => {
    try {
      await toggleEstadoCompletadaCard(token!, tareaId, completada);
      const tarea = tareas.find((t) => t.id === tareaId);
      if (!tarea) return;
      queryClient.invalidateQueries({ queryKey: ['cards', tarea.listaId] });
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const handleCrearCard = async (e: React.FormEvent, listaId: string) => {
    e.preventDefault();
    const data = nuevaTarea[listaId];
    if (!data?.titulo || !data?.descripcion) return;
    try {
      await crearCardEnLista(token!, listaId, data);
      queryClient.invalidateQueries({ queryKey: ['cards', listaId] });
      setNuevaTarea((prev) => ({ ...prev, [listaId]: { titulo: '', descripcion: '' } }));
      setMostrarFormulario((prev) => ({ ...prev, [listaId]: false }));
    } catch (err: any) {
      toast.error((err as any).message || 'Error al crear tarea');
    }
  };

  const { data: proyecto } = useQuery({
    queryKey: ['proyecto', id],
    queryFn: () => obtenerProyectoPorId(token!, id!),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawListas = [] } = useQuery({
    queryKey: ['listas', id],
    queryFn: () => obtenerListasPorProyecto(token!, id!),
    enabled: !!token && !!id,
  });

  const listas: Lista[] = (rawListas as any[]).map((l: any) => ({
    ...l,
    _id: String(l._id ?? l.id),
  }));

  const tareasQueries = useQueries({
    queries: listas.map((lista: Lista) => ({
      queryKey: ['cards', lista._id],
      queryFn: () => obtenerCardsPorLista(token!, lista._id),
      enabled: !!token && !!lista._id,
    })),
  });

  const [localOrderMap, setLocalOrderMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const updates: Record<string, any[]> = {};
    tareasQueries.forEach((q, idx) => {
      const listId = listas[idx]?._id;
      if (listId && q.data && !q.isFetching) {
        updates[listId] = q.data as any[];
      }
    });
    if (Object.keys(updates).length > 0) {
      setLocalOrderMap(prev => ({ ...prev, ...updates }));
    }
  }, [tareasQueries.map(q => q.dataUpdatedAt).join(',')]);

  const mapearCard = (c: any, listaId: string): Tarea => ({
    id: String(c._id ?? c.id),
    titulo: c.titulo,
    descripcion: c.descripcion,
    completada: c.completada,
    listaId,
    fechaInicio: c.fechaInicio,
    fechaFin: c.fechaFin,
    checklist: (c.checklist || []).map((item: any) => ({ ...item, id: Number(item.id) })),
    etiquetas: (c.etiquetas || []).map((e: any) => ({ ...e, id: Number(e.id) })),
  });

  const tareas: Tarea[] = listas.flatMap((lista, idx) => {
    const raw = localOrderMap[lista._id] ?? (tareasQueries[idx]?.data as any[] ?? []);
    return raw.map((c: any) => mapearCard(c, lista._id));
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;
    const prevSource = localOrderMap[sourceListId] ?? (queryClient.getQueryData<any[]>(['cards', sourceListId]) ?? []);
    const prevDest   = localOrderMap[destListId]   ?? (queryClient.getQueryData<any[]>(['cards', destListId])   ?? []);

    if (sourceListId === destListId) {
      const cards = [...prevSource];
      const [moved] = cards.splice(source.index, 1);
      cards.splice(destination.index, 0, moved);
      const reordered = cards.map((c, i) => ({ ...c, posicion: i }));
      setLocalOrderMap(prev => ({ ...prev, [sourceListId]: reordered }));
      reordenarCards(token!, sourceListId, reordered.map(c => ({ id: String(c.id ?? c._id), posicion: c.posicion })))
        .catch(() => setLocalOrderMap(prev => ({ ...prev, [sourceListId]: prevSource })));
    } else {
      const sourceCards = [...prevSource];
      const destCards   = [...prevDest];
      const [moved] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, { ...moved });
      setLocalOrderMap(prev => ({ ...prev, [sourceListId]: sourceCards, [destListId]: destCards }));
      moverCardALista(token!, draggableId, destListId)
        .catch(() => setLocalOrderMap(prev => ({ ...prev, [sourceListId]: prevSource, [destListId]: prevDest })));
    }
  };

  const handlePlanificacionCompletada = () => {
    queryClient.invalidateQueries({ queryKey: ['listas', id] });
    listas.forEach((lista: Lista) => {
      queryClient.invalidateQueries({ queryKey: ['cards', lista._id] });
    });
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 flex-shrink-0">
            <Breadcrumb items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: proyecto?.nombre || '...', href: `/projects/${id}` },
              { label: 'Tablero' },
            ]} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tablero Kanban</h1>
          </div>

          <div className="flex-1 overflow-x-auto p-6">
            {listas.length === 0 && tareasQueries.every(q => !q.isLoading) && (
              <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4">
                <svg className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-5" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">El tablero está vacío</h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mb-6">
                  Creá tu primera lista para empezar a organizar las tareas del proyecto.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setMostrarIA(false)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Nueva lista
                  </button>
                  <button
                    onClick={() => setMostrarIA(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Planificar con IA
                  </button>
                </div>
              </div>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="w-full overflow-x-auto pb-4">
                <div className="flex gap-4 w-max min-h-[350px]">
                  {listas.map((lista: Lista) => {
                    const tareasDeLista = tareas.filter((t) => t.listaId === lista._id);
                    const mostrandoFormulario = !!mostrarFormulario[lista._id];
                    const tareaData = nuevaTarea[lista._id] || { titulo: '', descripcion: '' };

                    return (
                      <ListaKanban
                        key={lista._id}
                        lista={lista}
                        tareas={tareasDeLista}
                        editandoListaId={editandoListaId}
                        nuevoNombreLista={nuevoNombreLista}
                        mostrarFormulario={mostrandoFormulario}
                        nuevaTarea={tareaData}
                        onEditarNombre={setNuevoNombreLista}
                        onGuardarNombre={() => {
                          if (!token) return;
                          editarListaMutate({ token, listaId: lista._id, nombre: nuevoNombreLista });
                          setEditandoListaId(null);
                        }}
                        onIniciarEdicion={() => {
                          setEditandoListaId(lista._id);
                          setNuevoNombreLista(lista.nombre);
                        }}
                        onEliminarLista={() => setListaAEliminar(lista._id)}
                        onToggleCompletada={toggleCompletada}
                        onAbrirTarea={abrirDetalleTarea}
                        onMostrarFormulario={() =>
                          setMostrarFormulario((prev) => ({ ...prev, [lista._id]: true }))
                        }
                        onOcultarFormulario={() =>
                          setMostrarFormulario((prev) => ({ ...prev, [lista._id]: false }))
                        }
                        onActualizarNuevaTarea={(field, valor) =>
                          setNuevaTarea((prev) => ({
                            ...prev,
                            [lista._id]: { ...prev[lista._id], [field]: valor },
                          }))
                        }
                        onCrearTarea={(e) => handleCrearCard(e, lista._id)}
                        listaAEliminar={listaAEliminar === lista._id}
                        onConfirmarEliminar={() => {
                          if (!token || !listaAEliminar) return;
                          eliminarListaMutate({ token, listaId: listaAEliminar });
                          setListaAEliminar(null);
                        }}
                        onCancelarEliminar={() => setListaAEliminar(null)}
                        obtenerProgresoChecklist={obtenerProgresoChecklist}
                      />
                    );
                  })}
                </div>
              </div>
            </DragDropContext>

            <FormularioNuevaLista
              nuevaLista={nuevaLista}
              onCambiarNombre={setNuevaLista}
              onCrearLista={async (e) => {
                e.preventDefault();
                if (!nuevaLista.trim()) return;
                try {
                  const response = await crearLista(token!, id!, nuevaLista);
                  const nueva = response.lista;
                  setNuevaLista('');
                  queryClient.invalidateQueries({ queryKey: ['listas', id] });
                  if (nueva && nueva._id) {
                    queryClient.invalidateQueries({ queryKey: ['cards', nueva._id] });
                  }
                } catch (err: any) {
                  toast.error(err.message || 'Error al crear la lista');
                }
              }}
            />

            <BotonPlanificadorIA
              mostrarIA={mostrarIA}
              onToggle={() => setMostrarIA(!mostrarIA)}
            />

            {mostrarIA && (
              <div className="mt-6">
                <PlanificadorIA
                  proyectoId={id!}
                  token={token ?? undefined}
                  onPlanificacionCompletada={handlePlanificacionCompletada}
                />
              </div>
            )}

            {tareaSeleccionada && (
              <ModalDetalleTarea
                tarea={tareaSeleccionada}
                isSaving={guardandoCard}
                etiquetas={etiquetasHook.etiquetas}
                checklist={checklistHook.checklist}
                nuevoChecklist={checklistHook.nuevoChecklist}
                nuevoNombreChecklist={checklistHook.nuevoNombreChecklist}
                editandoCard={editandoCard}
                nuevoTitulo={nuevoTitulo}
                nuevaDescripcion={nuevaDescripcion}
                editandoItemId={checklistHook.editandoItemId}
                nuevaEtiqueta={etiquetasHook.nuevaEtiqueta}

                onClose={() => setTareaSeleccionada(null)}
                onEditar={() => {
                  setEditandoCard(true);
                  setNuevoTitulo(tareaSeleccionada.titulo);
                  setNuevaDescripcion(tareaSeleccionada.descripcion);
                }}
                onGuardarEdicion={async () => {
                  if (!token || !tareaSeleccionada || guardandoCard) return;
                  setGuardandoCard(true);
                  editarCardMutate({
                    token,
                    cardId: tareaSeleccionada.id,
                    titulo: nuevoTitulo,
                    descripcion: nuevaDescripcion,
                  }, {
                    onSuccess: async () => {
                      const actualizada = await obtenerCardPorId(token, tareaSeleccionada.listaId, tareaSeleccionada.id);
                      setTareaSeleccionada(actualizada);
                      setEditandoCard(false);
                      setGuardandoCard(false);
                    },
                    onError: () => setGuardandoCard(false),
                  });
                }}
                onEliminar={() => {
                  if (!token || !tareaSeleccionada) return;
                  eliminarCardMutate({ token, cardId: tareaSeleccionada.id });
                  setTareaSeleccionada(null);
                }}
                onActualizarTitulo={setNuevoTitulo}
                onActualizarDescripcion={setNuevaDescripcion}

                onAgregarEtiqueta={etiquetasHook.handleAgregarEtiqueta}
                onEliminarEtiqueta={etiquetasHook.handleEliminarEtiqueta}
                onActualizarEtiqueta={(field, value) =>
                  etiquetasHook.setNuevaEtiqueta((prev) => ({ ...prev, [field]: value }))
                }

                onToggleChecklist={checklistHook.toggleChecklistItem}
                onAgregarChecklist={checklistHook.handleAgregarChecklist}
                onEliminarChecklist={checklistHook.eliminarItemChecklist}
                onEditarChecklist={(itemId, nombre) => {
                  checklistHook.setEditandoItemId(itemId);
                  checklistHook.setNuevoNombreChecklist(nombre);
                }}
                onGuardarChecklistNombre={checklistHook.guardarNombreChecklist}
                onActualizarChecklistNombre={checklistHook.setNuevoChecklist}

                onFechaInicioChange={async (fecha) => {
                  if (!token || !tareaSeleccionada) return;
                  const nuevaFechaFin = tareaSeleccionada.fechaFin || new Date(Date.now() + 86400000).toISOString();
                  await actualizarFechasCard(token, tareaSeleccionada.id, { fechaInicio: fecha, fechaFin: nuevaFechaFin });
                  setTareaSeleccionada((prev) => prev ? { ...prev, fechaInicio: fecha } : prev);
                  queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
                }}
                onFechaFinChange={async (fecha) => {
                  if (!token || !tareaSeleccionada) return;
                  const nuevaFechaInicio = tareaSeleccionada.fechaInicio || new Date().toISOString();
                  await actualizarFechasCard(token, tareaSeleccionada.id, { fechaInicio: nuevaFechaInicio, fechaFin: fecha });
                  setTareaSeleccionada((prev) => prev ? { ...prev, fechaFin: fecha } : prev);
                  queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
                }}
              />
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
