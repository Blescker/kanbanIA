import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Tarea {
  id: number;
  proyectoId: number;
  titulo: string;
  descripcion: string;
  estado: 'Pendiente' | 'En progreso' | 'Hecha';
  fecha: string;
}

export const TaskFormPage = () => {
  const { id } = useParams(); // proyectoId
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    estado: '',
    fecha: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.titulo || !form.descripcion || !form.estado || !form.fecha) {
      return setError('Todos los campos son obligatorios');
    }

    const nuevaTarea: Tarea = {
      id: Date.now(),
      proyectoId: Number(id),
      titulo: form.titulo,
      descripcion: form.descripcion,
      estado: form.estado as Tarea['estado'],
      fecha: form.fecha,
    };

    const tareasGuardadas = JSON.parse(localStorage.getItem('tareas') || '[]');
    localStorage.setItem('tareas', JSON.stringify([...tareasGuardadas, nuevaTarea]));

    navigate(`/projects/${id}/tasks`);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">➕ Nueva Tarea</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="titulo"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Seleccionar estado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En progreso">En progreso</option>
          <option value="Hecha">Hecha</option>
        </select>

        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear tarea
        </button>
        <button
        type="button"
        onClick={() => navigate(`/projects/${id}/tasks`)}
        className="text-blue-600 hover:underline ml-2"
        >
        Cancelar
        </button>

      </form>
    </div>
  );
};
