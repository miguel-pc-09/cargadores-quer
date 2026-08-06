export type EstadoCarga = "activa" | "finalizada" | "cancelada";

export interface DatosNuevaCarga {
  usuarioId: string;
  reservaId: string;
  cargadorId: string;
  tomaId: string;

  fechaHoraInicio: string;
  fechaHoraFinPrevista: string;

  potenciaMaximaKw: number;
}

export interface Carga extends DatosNuevaCarga {
  id: string;
  estado: EstadoCarga;

  fechaHoraFinReal: string | null;

  potenciaActualKw: number;
  energiaConsumidaKwh: number;

  creadaEn: string;
}
