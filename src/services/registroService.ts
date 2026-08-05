import type { Cliente } from "../types/cliente";
import type { DatosFormularioRegistro } from "../types/registro";

export interface SolicitudRegistro {
  cliente: Cliente;
  formulario: DatosFormularioRegistro;
}

export async function enviarSolicitudRegistro(
  solicitud: SolicitudRegistro,
): Promise<void> {
  /*
   * Simulación temporal hasta conectar Supabase.
   *
   * Este archivo será el encargado de comunicarse con el backend.
   * RegistroPage no debe guardar directamente en la base de datos.
   */

  await new Promise((resolve) => {
    window.setTimeout(resolve, 900);
  });

  console.log("Solicitud de registro preparada:", solicitud);
}
