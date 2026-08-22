// Estados posibles de validación del vehículo.
export type EstadoValidacionVehiculo = "validado" | "pendiente" | "rechazado";

// Datos del vehículo del usuario.
export interface DatosVehiculo {
  id: string;
  usuarioId: string;
  matricula: string;
  estadoValidacion: EstadoValidacionVehiculo;
}
