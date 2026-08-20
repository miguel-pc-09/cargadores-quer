// Estados posibles de una carga.
export type EstadoCarga = "activa" | "finalizada" | "cancelada";

// Datos necesarios para crear una carga.
export interface DatosNuevaCarga {
  usuarioId: string;
  reservaId: string;
  cargadorId: string;
  tomaId: string;

  fechaHoraInicio: string;
  fechaHoraFinPrevista: string;

  potenciaMaximaKw: number;
}

// Datos completos de una carga.
export interface Carga extends DatosNuevaCarga {
  id: string;
  estado: EstadoCarga;

  fechaHoraFinReal: string | null;

  potenciaActualKw: number;
  energiaConsumidaKwh: number;

  creadaEn: string;
}
