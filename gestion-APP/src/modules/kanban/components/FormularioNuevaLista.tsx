import React from "react";

interface FormularioNuevaListaProps {
  nuevaLista: string;
  onCambiarNombre: (nombre: string) => void;
  onCrearLista: (e: React.FormEvent) => void;
}

export const FormularioNuevaLista: React.FC<FormularioNuevaListaProps> = ({
  nuevaLista,
  onCambiarNombre,
  onCrearLista,
}) => {
  return (
    <div className="mt-8 max-w-md mx-auto bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-3 text-center">➕ Añadir nueva lista</h2>
      <form onSubmit={onCrearLista} className="flex gap-2">
        <input
          type="text"
          placeholder="Nombre de la lista"
          value={nuevaLista}
          onChange={(e) => onCambiarNombre(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700"
        >
          Crear
        </button>
      </form>
    </div>
  );
};