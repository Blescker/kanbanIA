import axios from "axios";
import { API_BASE_URL } from "./config";
export interface PlanificacionResponse {
  mensajeIA: string;
  listas?: any[];
  operaciones?: any[];
  resumen?: string;
}

export const planificarProyecto = async (
  descripcion: string,
  proyectoId: string,
  token: string
): Promise<PlanificacionResponse> => {

  // Validaciones previas
  if (!descripcion || !proyectoId || !token) {
    throw new Error("Faltan datos para planificar el proyecto");
  }

  try {
    const { data } = await axios.post<PlanificacionResponse>(
      `${API_BASE_URL}/planificar`,
      { descripcion, proyectoId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error: any) {
    throw error;
  }
};
