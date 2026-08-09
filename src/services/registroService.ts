import type { Cliente } from "../types/cliente";
import type { DatosFormularioRegistro } from "../types/registro";

export interface SolicitudRegistro {
  cliente: Cliente;
  formulario: DatosFormularioRegistro;
}

const RETARDO_SIMULADO_MS = 900;

function esperar(milisegundos: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milisegundos);
  });
}

export async function enviarSolicitudRegistro(
  _solicitud: SolicitudRegistro,
): Promise<void> {
  /*
   * Simulación temporal hasta conectar Supabase.
   *
   * RegistroPage únicamente prepara la solicitud.
   * Este servicio será sustituido por la llamada
   * real al backend.
   */

  await esperar(RETARDO_SIMULADO_MS);
}
