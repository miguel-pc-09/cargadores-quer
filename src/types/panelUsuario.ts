export type TipoAlertaUsuario = "informacion" | "correcto" | "aviso" | "error";

export type TipoActividadUsuario =
  | "carga-iniciada"
  | "carga-finalizada"
  | "reserva-creada"
  | "reserva-cancelada";

export type EstadoUsuario = "correcto" | "penalizado" | "advertencia";

export interface AlertaUsuario {
  id: number;
  tipo: TipoAlertaUsuario;
  titulo: string;
  mensaje: string;
}

export interface ActividadUsuario {
  id: number;
  tipo: TipoActividadUsuario;
  titulo: string;
  ubicacion: string;
  toma: string;
  fecha: string;
  hora: string;
  detalle: string;
}

export interface ResumenUsuario {
  numeroCargadores: number;
  numeroTomas: number;
  numeroCargas: number;
  energiaAcumulada: number;
  reservasActivas: number;
  proximaReserva?: string;
  estado: EstadoUsuario;
  numeroPenalizaciones: number;
}
