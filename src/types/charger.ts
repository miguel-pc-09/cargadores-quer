export type EstadoCargador = "conectado" | "desconectado" | "mantenimiento";

export type EstadoToma =
  | "libre"
  | "ocupada"
  | "reservada"
  | "fuera-servicio"
  | "mi-carga";

export interface TomaCargador {
  id: string;
  nombre: string;
  estado: EstadoToma;
  potenciaMaximaKw: number;
  permiteReserva: boolean;
  disponibleDesde?: string;
  usuarioActual?: string;
}

export interface Cargador {
  id: string;
  nombre: string;
  direccion: string;
  estado: EstadoCargador;
  permiteReserva: boolean;
  tomas: TomaCargador[];

  ubicacion?: string;
  fabricante?: string;
  gestor?: string;
}
