export type TipoVehiculo = "electrico" | "hibrido-enchufable";

export type EstadoValidacionVehiculo = "validado" | "pendiente" | "rechazado";

export interface DatosVehiculo {
  marcaModelo: string;
  matricula: string;
  tipo: TipoVehiculo;
  estadoValidacion: EstadoValidacionVehiculo;
}

export interface DatosPerfilUsuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  vehiculo: DatosVehiculo;
}
