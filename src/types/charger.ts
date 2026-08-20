// Estados posibles de un cargador.
export type EstadoCargador = "conectado" | "desconectado" | "mantenimiento";

// Estados posibles de una toma.
export type EstadoToma =
  | "libre"
  | "ocupada"
  | "reservada"
  | "fuera-servicio"
  | "mi-carga";

// Datos de una toma.
export interface TomaCargador {
  id: string;
  nombre: string;
  estado: EstadoToma;
  potenciaMaximaKw: number;
  permiteReserva: boolean;
  tipoConector?: string;
  disponibleDesde?: string;
  usuarioActual?: string;
}

// Datos de un cargador.
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
