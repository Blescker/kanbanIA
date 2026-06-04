import React from "react";

interface BotonPlanificadorIAProps {
  mostrarIA: boolean;
  onToggle: () => void;
}

export const BotonPlanificadorIA: React.FC<BotonPlanificadorIAProps> = ({ mostrarIA, onToggle }) => {
  return (
    <div className="mt-6 text-center">
      <button
        onClick={onToggle}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-full shadow transition"
      >
        {mostrarIA ? "🔽 Cerrar asistente IA" : "🤖 ¿Necesitas ayuda para planificar? Usa IA"}
      </button>
    </div>
  );
};