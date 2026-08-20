// Estados posibles de validación del vehículo.
export type EstadoValidacionVehiculo = "validado" | "pendiente" | "rechazado";

// Datos del vehículo del usuario.
export interface DatosVehiculo {
  id: string;
  usuarioId: string;
  matricula: string;
  estadoValidacion: EstadoValidacionVehiculo;
}

// Datos del perfil del usuario.
export interface DatosPerfilUsuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  vehiculo: DatosVehiculo | null;
}
