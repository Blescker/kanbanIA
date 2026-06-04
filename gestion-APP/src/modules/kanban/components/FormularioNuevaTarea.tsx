import React from "react";

interface FormularioNuevaTareaProps {
  titulo: string;
  descripcion: string;
  onChangeTitulo: (valor: string) => void;
  onChangeDescripcion: (valor: string) => void;
  onCancelar: () => void;
  onGuardar: (e: React.FormEvent) => void;
}

export const FormularioNuevaTarea: React.FC<FormularioNuevaTareaProps> = ({
  titulo,
  descripcion,
  onChangeTitulo,
  onChangeDescripcion,
  onCancelar,
  onGuardar,
}) => {
  return (
    <form onSubmit={onGuardar} className="mt-3 space-y-2">
      <input
        type="text"
        placeholder="Título de la tarea"
        value={titulo}
        onChange={(e) => onChangeTitulo(e.target.value)}
        className="w-full p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <input
        type="text"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => onChangeDescripcion(e.target.value)}
        className="w-full p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="w-full px-2 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="w-full bg-green-500 text-white px-2 py-1 text-sm rounded hover:bg-green-600"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};