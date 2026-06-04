import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

interface Etiqueta {
  id: number;
  nombre: string;
  color: string;
}

interface ChecklistItem {
  id: number;
  nombre: string;
  completado: boolean;
}

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  completada?: boolean;
  listaId: string;
  fechaFin?: string;
  checklist?: ChecklistItem[];
  etiquetas?: Etiqueta[];
}

interface TareaCardProps {
  tarea: Tarea;
  index: number;
  onToggleCompletada: (tareaId: string, completada: boolean) => void;
  onAbrirTarea: (tarea: Tarea) => void;
  obtenerProgresoChecklist: (checklist?: ChecklistItem[]) => string | null;
}

const getDueDateInfo = (fechaFin?: string, completada?: boolean) => {
  if (!fechaFin || completada) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(fechaFin);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0)  return { label: 'Vencida',         cls: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' };
  if (diff === 0) return { label: 'Hoy',             cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' };
  if (diff <= 3)  return { label: `${diff}d`,        cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' };
  return {
    label: due.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
    cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  };
};

export const TareaCard: React.FC<TareaCardProps> = ({
  tarea,
  index,
  onToggleCompletada,
  onAbrirTarea,
  obtenerProgresoChecklist,
}) => {
  const tieneEtiquetas = Array.isArray(tarea.etiquetas) && tarea.etiquetas.length > 0;
  const tieneChecklist = Array.isArray(tarea.checklist) && tarea.checklist.length > 0;
  const dueDateInfo    = getDueDateInfo(tarea.fechaFin, tarea.completada);

  const checklistTotal      = tarea.checklist?.length ?? 0;
  const checklistCompletados = tarea.checklist?.filter(c => c.completado).length ?? 0;
  const checklistPct        = checklistTotal > 0 ? Math.round((checklistCompletados / checklistTotal) * 100) : 0;

  return (
    <Draggable draggableId={tarea.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onAbrirTarea(tarea)}
          className={`rounded-xl p-3.5 mb-2.5 shadow-sm border cursor-pointer select-none transition-shadow
            ${snapshot.isDragging
              ? 'shadow-xl rotate-1 scale-[1.02]'
              : 'hover:shadow-md'
            }
            ${tarea.completada
              ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-70'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
        >
          {/* Etiquetas */}
          {tieneEtiquetas && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {tarea.etiquetas!.map((etiqueta) => (
                <span
                  key={etiqueta.id}
                  className="px-2 py-0.5 text-[11px] rounded-full font-medium text-white"
                  style={{ backgroundColor: etiqueta.color }}
                >
                  {etiqueta.nombre}
                </span>
              ))}
            </div>
          )}

          {/* Título + checkbox */}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={tarea.completada || false}
              onChange={(e) => { e.stopPropagation(); onToggleCompletada(tarea.id, e.target.checked); }}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 cursor-pointer flex-shrink-0"
            />
            <p className={`text-sm font-medium leading-snug flex-1 ${
              tarea.completada ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'
            }`}>
              {tarea.titulo}
            </p>
          </div>

          {/* Footer: checklist + fecha */}
          {(tieneChecklist || dueDateInfo) && (
            <div className="mt-2.5 space-y-2">
              {/* Barra de progreso checklist */}
              {tieneChecklist && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {obtenerProgresoChecklist(tarea.checklist!)}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{checklistPct}%</span>
                  </div>
                  <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${checklistPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${checklistPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Chip de fecha */}
              {dueDateInfo && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${dueDateInfo.cls}`}>
                    {dueDateInfo.label}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
