// src/modules/tasks/TaskListPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Tarea {
  id: number;
  proyectoId: number;
  titulo: string;
  descripcion: string;
  estado: 'Pendiente' | 'En progreso' | 'Hecha';
  fecha: string;
}

export const TaskListPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);

  useEffect(() => {
    const storedTareas = localStorage.getItem('tareas');
    if (storedTareas) {
      const todas = JSON.parse(storedTareas);
      const tareasFiltradas = todas.filter((t: Tarea) => t.proyectoId === Number(id));
      setTareas(tareasFiltradas);
    }
  }, [id]);

  const guardarTareas = (actualizadas: Tarea[]) => {
    const todas = JSON.parse(localStorage.getItem('tareas') || '[]');
    const otras = todas.filter((t: Tarea) => t.proyectoId !== Number(id));
    localStorage.setItem('tareas', JSON.stringify([...otras, ...actualizadas]));
    setTareas(actualizadas);
  };

  const eliminarTarea = (idTarea: number) => {
    const actualizadas = tareas.filter((t) => t.id !== idTarea);
    guardarTareas(actualizadas);
  };

  const handleGuardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    if (tareaEditando) {
      const actualizadas = tareas.map((t) =>
        t.id === tareaEditando.id ? tareaEditando : t
      );
      guardarTareas(actualizadas);
      setTareaEditando(null);
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(`/projects/${id}`)}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Volver al proyecto
      </button>

      <h1 className="text-2xl font-bold mb-4">📝 Tareas del proyecto {id}</h1>

      <button
        onClick={() => navigate(`/projects/${id}/tasks/new`)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-6"
      >
        ➕ Nueva tarea
      </button>

      {tareas.length === 0 ? (
        <p className="text-gray-600">Este proyecto aún no tiene tareas.</p>
      ) : (
        <ul className="space-y-3">
          {tareas.map((tarea) => (
            <li
              key={tarea.id}
              className="border rounded p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg">{tarea.titulo}</h3>
              <p className="text-sm text-gray-600">{tarea.descripcion}</p>
              <p className="text-xs text-gray-500">
                Estado: {tarea.estado} | Fecha: {tarea.fecha}
              </p>

              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => setTareaEditando(tarea)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => eliminarTarea(tarea.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  ❌ Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de edición */}
      {tareaEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">✏️ Editar Tarea</h2>
            <form onSubmit={handleGuardarEdicion} className="space-y-3">
              <input
                type="text"
                value={tareaEditando.titulo}
                onChange={(e) =>
                  setTareaEditando({ ...tareaEditando, titulo: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Título"
              />
              <input
                type="text"
                value={tareaEditando.descripcion}
                onChange={(e) =>
                  setTareaEditando({ ...tareaEditando, descripcion: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Descripción"
              />
              <select
                value={tareaEditando.estado}
                onChange={(e) =>
                  setTareaEditando({
                    ...tareaEditando,
                    estado: e.target.value as Tarea['estado'],
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Hecha">Hecha</option>
              </select>
              <input
                type="date"
                value={tareaEditando.fecha}
                onChange={(e) =>
                  setTareaEditando({ ...tareaEditando, fecha: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setTareaEditando(null)}
                  className="text-red-600 hover:underline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
