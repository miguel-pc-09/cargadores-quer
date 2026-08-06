import type { Carga } from "../types/carga";

export interface EstadisticasCargas {
  energiaTotalKwh: number;
  energiaMesActualKwh: number;
  energiaAnioActualKwh: number;

  numeroSesiones: number;
  numeroSesionesMesActual: number;

  tiempoTotalMinutos: number;
  tiempoMesActualMinutos: number;

  potenciaMediaKw: number;

  costeDisponible: boolean;
  costeEstimadoEuros: number | null;
  tarifaReferenciaEuroKwh: number | null;
}

/*
 * De momento no existe una tarifa municipal confirmada.
 *
 * Cuando el Ayuntamiento defina un precio, bastará con
 * sustituir null por el importe correspondiente.
 *
 * Ejemplo:
 * const TARIFA_REFERENCIA_EURO_KWH = 0.25;
 */
const TARIFA_REFERENCIA_EURO_KWH: number | null = null;

function redondear(valor: number, decimales = 2) {
  const factor = 10 ** decimales;

  return Math.round((valor + Number.EPSILON) * factor) / factor;
}

function obtenerFechaFinCarga(carga: Carga) {
  if (carga.fechaHoraFinReal) {
    return new Date(carga.fechaHoraFinReal);
  }

  return new Date(carga.fechaHoraFinPrevista);
}

function calcularDuracionCargaMinutos(carga: Carga) {
  const fechaInicio = new Date(carga.fechaHoraInicio);
  const fechaFin = obtenerFechaFinCarga(carga);

  const diferenciaMs = fechaFin.getTime() - fechaInicio.getTime();

  if (
    Number.isNaN(fechaInicio.getTime()) ||
    Number.isNaN(fechaFin.getTime()) ||
    diferenciaMs <= 0
  ) {
    return 0;
  }

  return Math.round(diferenciaMs / 60_000);
}

function perteneceAlMesActual(carga: Carga, fechaActual: Date) {
  const fechaCarga = new Date(carga.fechaHoraInicio);

  return (
    fechaCarga.getFullYear() === fechaActual.getFullYear() &&
    fechaCarga.getMonth() === fechaActual.getMonth()
  );
}

function perteneceAlAnioActual(carga: Carga, fechaActual: Date) {
  const fechaCarga = new Date(carga.fechaHoraInicio);

  return fechaCarga.getFullYear() === fechaActual.getFullYear();
}

function obtenerCargasContabilizables(cargas: Carga[]) {
  return cargas.filter(
    (carga) => carga.estado === "finalizada" || carga.estado === "activa",
  );
}

export function calcularEstadisticasCargas(
  cargas: Carga[],
  fechaActual = new Date(),
): EstadisticasCargas {
  const cargasContabilizables = obtenerCargasContabilizables(cargas);

  const cargasMesActual = cargasContabilizables.filter((carga) =>
    perteneceAlMesActual(carga, fechaActual),
  );

  const cargasAnioActual = cargasContabilizables.filter((carga) =>
    perteneceAlAnioActual(carga, fechaActual),
  );

  const energiaTotalKwh = cargasContabilizables.reduce(
    (total, carga) => total + carga.energiaConsumidaKwh,
    0,
  );

  const energiaMesActualKwh = cargasMesActual.reduce(
    (total, carga) => total + carga.energiaConsumidaKwh,
    0,
  );

  const energiaAnioActualKwh = cargasAnioActual.reduce(
    (total, carga) => total + carga.energiaConsumidaKwh,
    0,
  );

  const tiempoTotalMinutos = cargasContabilizables.reduce(
    (total, carga) => total + calcularDuracionCargaMinutos(carga),
    0,
  );

  const tiempoMesActualMinutos = cargasMesActual.reduce(
    (total, carga) => total + calcularDuracionCargaMinutos(carga),
    0,
  );

  const sumaPotencias = cargasContabilizables.reduce(
    (total, carga) => total + carga.potenciaActualKw,
    0,
  );

  const potenciaMediaKw =
    cargasContabilizables.length > 0
      ? sumaPotencias / cargasContabilizables.length
      : 0;

  const costeDisponible = TARIFA_REFERENCIA_EURO_KWH !== null;

  const costeEstimadoEuros =
    TARIFA_REFERENCIA_EURO_KWH !== null
      ? energiaTotalKwh * TARIFA_REFERENCIA_EURO_KWH
      : null;

  return {
    energiaTotalKwh: redondear(energiaTotalKwh),

    energiaMesActualKwh: redondear(energiaMesActualKwh),

    energiaAnioActualKwh: redondear(energiaAnioActualKwh),

    numeroSesiones: cargasContabilizables.length,

    numeroSesionesMesActual: cargasMesActual.length,

    tiempoTotalMinutos,

    tiempoMesActualMinutos,

    potenciaMediaKw: redondear(potenciaMediaKw, 1),

    costeDisponible,

    costeEstimadoEuros:
      costeEstimadoEuros !== null ? redondear(costeEstimadoEuros) : null,

    tarifaReferenciaEuroKwh: TARIFA_REFERENCIA_EURO_KWH,
  };
}

export function formatearTiempoTotal(minutosTotales: number) {
  const minutosSeguros = Math.max(0, Math.round(minutosTotales));

  const dias = Math.floor(minutosSeguros / (24 * 60));

  const horas = Math.floor((minutosSeguros % (24 * 60)) / 60);

  const minutos = minutosSeguros % 60;

  if (dias > 0) {
    return `${dias} ${dias === 1 ? "día" : "días"} ${horas} h`;
  }

  if (horas > 0) {
    return `${horas} h ${minutos} min`;
  }

  return `${minutos} min`;
}

export function formatearEnergia(energiaKwh: number) {
  return energiaKwh.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatearCoste(costeEuros: number) {
  return costeEuros.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
