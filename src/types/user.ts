export type EstadoValidacionVehiculo = "validado" | "pendiente" | "rechazado";

export interface DatosVehiculo {
  id: string;
  usuarioId: string;
  matricula: string;
  estadoValidacion: EstadoValidacionVehiculo;
}

export interface DatosPerfilUsuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  vehiculo: DatosVehiculo | null;
}
