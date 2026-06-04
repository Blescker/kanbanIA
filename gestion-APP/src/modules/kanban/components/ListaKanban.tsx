import { Droppable } from '@hello-pangea/dnd';
import { TareaCard } from './TareaCard';
import { FormularioNuevaTarea } from './FormularioNuevaTarea';

import React from 'react';

interface Lista {
  _id: string;
  nombre: string;
  posicion: number;
}

interface ChecklistItem {
  id: number;
  nombre: string;
  completado: boolean;
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
  checklist?: ChecklistItem[];
  etiquetas?: Etiqueta[];
}

interface ListaKanbanProps {
  lista: Lista;
  tareas: Tarea[];
  editandoListaId: string | null;
  nuevoNombreLista: string;
  mostrarFormulario: boolean;
  nuevaTarea: { titulo: string; descripcion: string };

  onEditarNombre: (nombre: string) => void;
  onGuardarNombre: () => void;
  onIniciarEdicion: () => void;
  onEliminarLista: () => void;

  onToggleCompletada: (tareaId: string, completada: boolean) => void;
  onAbrirTarea: (tarea: Tarea) => void;

  onMostrarFormulario: () => void;
  onOcultarFormulario: () => void;
  onActualizarNuevaTarea: (field: 'titulo' | 'descripcion', valor: string) => void;
  onCrearTarea: (e: React.FormEvent) => void;

  listaAEliminar: boolean;
  onConfirmarEliminar: () => void;
  onCancelarEliminar: () => void;
  obtenerProgresoChecklist: (checklist?: ChecklistItem[]) => string | null;
}

export const ListaKanban: React.FC<ListaKanbanProps> = ({
  lista,
  tareas,
  editandoListaId,
  nuevoNombreLista,
  mostrarFormulario,
  nuevaTarea,
  onEditarNombre,
  onGuardarNombre,
  onIniciarEdicion,
  onEliminarLista,
  onToggleCompletada,
  onAbrirTarea,
  onMostrarFormulario,
  onOcultarFormulario,
  onActualizarNuevaTarea,
  onCrearTarea,
  listaAEliminar,
  onConfirmarEliminar,
  onCancelarEliminar,
  obtenerProgresoChecklist,
}) => {
  return (
    <Droppable droppableId={lista._id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded min-w-[320px] max-w-xs transition-colors flex-shrink-0 shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            {editandoListaId === lista._id ? (
              <input
                value={nuevoNombreLista}
                onChange={(e) => onEditarNombre(e.target.value)}
                onBlur={onGuardarNombre}
                onKeyDown={(e) => e.key === 'Enter' && onGuardarNombre()}
                autoFocus
                className="border rounded px-2 py-1 text-sm"
              />
            ) : (
              <>
                {lista.nombre}
                <button onClick={onIniciarEdicion} className="ml-2 text-blue-500 hover:text-blue-700" title="Editar lista">✏️</button>
                <button onClick={onEliminarLista} className="ml-2 text-red-500 hover:text-red-700" title="Eliminar lista">🗑️</button>
                {listaAEliminar && (
                  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
                      <h3 className="text-lg font-semibold mb-4 text-center">¿Estás seguro?</h3>
                      <p className="text-sm mb-6 text-center">Esto eliminará la lista y todas sus tarjetas asociadas. Esta acción no se puede deshacer.</p>
                      <div className="flex justify-center gap-4">
                        <button onClick={onCancelarEliminar} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-black dark:text-white text-sm">Cancelar</button>
                        <button onClick={onConfirmarEliminar} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm">Eliminar</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </h2>
            
          {tareas.map((tarea, index) => {
            return (
                <TareaCard
                    key={tarea.id}
                    tarea={tarea}
                    index={index}
                    onToggleCompletada={onToggleCompletada}
                    onAbrirTarea={onAbrirTarea}
                    obtenerProgresoChecklist={obtenerProgresoChecklist}
                    />
            );
            })}

          {provided.placeholder}

          {!mostrarFormulario ? (
            <button onClick={onMostrarFormulario} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">➕ Añadir tarea</button>
          ) : (
            <FormularioNuevaTarea
                titulo={nuevaTarea.titulo}
                descripcion={nuevaTarea.descripcion}
                onChangeTitulo={(valor) => onActualizarNuevaTarea('titulo', valor)}
                onChangeDescripcion={(valor) => onActualizarNuevaTarea('descripcion', valor)}
                onCancelar={onOcultarFormulario}
                onGuardar={onCrearTarea}
                />
            )}
        </div>
      )}
    </Droppable>
  );
};