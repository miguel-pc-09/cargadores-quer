// Tipos de aviso disponibles.
export type TipoAlertaUsuario = "informacion" | "correcto" | "aviso" | "error";

// Tipos de actividad del usuario.
export type TipoActividadUsuario =
  | "carga-iniciada"
  | "carga-finalizada"
  | "reserva-creada"
  | "reserva-cancelada";

// Estados generales del usuario.
export type EstadoUsuario = "correcto" | "penalizado" | "advertencia";

// Datos de un aviso.
export interface AlertaUsuario {
  id: string;
  tipo: TipoAlertaUsuario;
  titulo: string;
  mensaje: string;
}

// Datos de una actividad reciente.
export interface ActividadUsuario {
  id: string;
  tipo: TipoActividadUsuario;
  titulo: string;
  ubicacion: string;
  toma: string;
  fecha: string;
  hora: string;
  detalle: string;
}

// Datos del resumen principal.
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
