// Estados posibles de una reserva.
export type EstadoReserva =
  | "confirmada"
  | "activa"
  | "finalizada"
  | "cancelada"
  | "caducada";

// Datos necesarios para crear una reserva.
export interface DatosNuevaReserva {
  usuarioId: string;
  cargadorId: string;
  tomaId: string;
  fecha: string;
  horaInicio: string;
  duracionMinutos: number;
}

// Datos completos de una reserva.
export interface Reserva extends DatosNuevaReserva {
  id: string;

  fechaFin: string;
  horaFin: string;

  creadaEn: string;
  estado: EstadoReserva;
}

// Reserva con fechas ya convertidas.
export interface ReservaConFechas extends Reserva {
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
}
