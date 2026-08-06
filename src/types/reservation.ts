export type EstadoReserva =
  | "confirmada"
  | "activa"
  | "finalizada"
  | "cancelada"
  | "caducada";

export interface DatosNuevaReserva {
  usuarioId: string;
  cargadorId: string;
  tomaId: string;
  fecha: string;
  horaInicio: string;
  duracionMinutos: number;
}

export interface Reserva extends DatosNuevaReserva {
  id: string;

  fechaFin: string;
  horaFin: string;

  creadaEn: string;
  estado: EstadoReserva;
}

export interface ReservaConFechas extends Reserva {
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
}
