import React, { useState } from "react";
import { planificarProyecto, PlanificacionResponse } from "../api/planificacion";
import ReactMarkdown from 'react-markdown'
interface Mensaje {
  from: "user" | "ia";
  text: string;
}

interface PlanificadorIAProps {
  proyectoId: string;
  token: string | undefined;
  onPlanificacionCompletada?: () => void;
}

const PlanificadorIA: React.FC<PlanificadorIAProps> = ({
  proyectoId,
  token,
  onPlanificacionCompletada,
}) => {
  const [conversacion, setConversacion] = useState<Mensaje[]>([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async () => {
    if (!input.trim() || !token) return;

    setCargando(true);
    const mensajeUsuario = input.trim();

    // Mostrar mensaje del usuario
    setConversacion((prev) => [...prev, { from: "user", text: mensajeUsuario }]);
    setInput("");

    try {
      const res: PlanificacionResponse = await planificarProyecto(mensajeUsuario, proyectoId, token);

      // Mostrar respuesta de la IA (texto sin JSON)
      if (res.mensajeIA) {
        setConversacion((prev) => [...prev, { from: "ia", text: res.mensajeIA }]);
      }

      // Plan completo nuevo
      if (res.listas && res.listas.length > 0) {
        const textoConfirmacion = res.estimacion
          ? `🎉 ¡Listo! Tu planificación ha sido generada.\n\n${res.estimacion}`
          : "🎉 ¡Listo! Tu planificación ha sido generada.";
        setConversacion((prev) => [
          ...prev,
          { from: "ia", text: textoConfirmacion },
        ]);
        if (onPlanificacionCompletada) onPlanificacionCompletada();
      }

      // Operaciones sobre el tablero existente
      if (res.operaciones && res.operaciones.length > 0) {
        if (res.resumen) {
          setConversacion((prev) => [...prev, { from: "ia", text: res.resumen! }]);
        }
        if (onPlanificacionCompletada) onPlanificacionCompletada();
      }
    } catch (err: any) {
      setConversacion((prev) => [
        ...prev,
        { from: "ia", text: "❌ Ocurrió un error con la IA. Intenta de nuevo." },
      ]);
    }

    setCargando(false);
  };

  return (
    <div className="flex flex-col w-full max-w-[900px] h-[80vh] mx-auto border border-gray-300 rounded-2xl p-4 sm:px-6 bg-white dark:bg-gray-900 dark:text-white shadow-lg">
      <h4 className="text-xl font-semibold mb-4">🤖 Planificador KanbanIA</h4>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3 px-1">
        {conversacion.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow ${
                msg.from === "user"
                  ? "bg-blue-600 text-white self-end"
                  : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white self-start"
              }`}
            >
              <b className="block text-xs mb-1">{msg.from === "user" ? "Tú" : "IA"}:</b>
              {msg.from === "ia" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <span>{msg.text}</span>
              )}
            </div>
          </div>
        ))}

        {cargando && (
          <div className="flex items-center gap-2 text-sm text-left animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl text-black dark:text-white italic">
              IA está escribiendo...
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center pt-2 border-t border-gray-300">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
          disabled={cargando || !token}
          placeholder="Ej: renombrá la lista 'To Do' a 'Pendiente', mové la card X a En Progreso..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button
          onClick={enviarMensaje}
          disabled={cargando || !input.trim() || !token}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </div>
    </div>
  );

};

export default PlanificadorIA;
