import type { Carga, DatosNuevaCarga } from "../types/carga";

const CLAVE_CARGAS = "cargaquer_cargas";
const RETARDO_SIMULADO_MS = 250;

function esperar(milisegundos: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milisegundos);
  });
}

function generarId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `carga-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function leerCargasGuardadas(): Carga[] {
  try {
    const contenido = localStorage.getItem(CLAVE_CARGAS);

    if (!contenido) {
      return [];
    }

    const resultado = JSON.parse(contenido);

    return Array.isArray(resultado) ? resultado : [];
  } catch {
    return [];
  }
}

function guardarCargas(cargas: Carga[]) {
  localStorage.setItem(CLAVE_CARGAS, JSON.stringify(cargas));
}

function calcularEnergiaConsumida(carga: Carga) {
  const inicio = new Date(carga.fechaHoraInicio).getTime();

  const fin = carga.fechaHoraFinReal
    ? new Date(carga.fechaHoraFinReal).getTime()
    : Date.now();

  const horasTranscurridas = Math.max(0, (fin - inicio) / 3_600_000);

  return Number((horasTranscurridas * carga.potenciaActualKw).toFixed(2));
}

function actualizarCargaCalculada(carga: Carga): Carga {
  if (carga.estado !== "activa") {
    return carga;
  }

  return {
    ...carga,
    energiaConsumidaKwh: calcularEnergiaConsumida(carga),
  };
}

export async function obtenerCargas(): Promise<Carga[]> {
  await esperar(RETARDO_SIMULADO_MS);

  const cargasActualizadas = leerCargasGuardadas().map(
    actualizarCargaCalculada,
  );

  guardarCargas(cargasActualizadas);

  return cargasActualizadas;
}

export async function obtenerCargasUsuario(
  usuarioId: string,
): Promise<Carga[]> {
  const cargas = await obtenerCargas();

  return cargas
    .filter((carga) => carga.usuarioId === usuarioId)
    .sort(
      (cargaA, cargaB) =>
        new Date(cargaB.fechaHoraInicio).getTime() -
        new Date(cargaA.fechaHoraInicio).getTime(),
    );
}

export async function obtenerCargaPorId(
  cargaId: string,
): Promise<Carga | null> {
  const cargas = await obtenerCargas();

  return cargas.find((carga) => carga.id === cargaId) ?? null;
}

export async function obtenerCargaActivaPorReserva(
  reservaId: string,
): Promise<Carga | null> {
  const cargas = await obtenerCargas();

  return (
    cargas.find(
      (carga) => carga.reservaId === reservaId && carga.estado === "activa",
    ) ?? null
  );
}

export async function iniciarCarga(
  datosCarga: DatosNuevaCarga,
): Promise<Carga> {
  await esperar(RETARDO_SIMULADO_MS);

  const cargas = leerCargasGuardadas();

  const cargaExistente = cargas.find(
    (carga) =>
      carga.reservaId === datosCarga.reservaId && carga.estado === "activa",
  );

  if (cargaExistente) {
    return cargaExistente;
  }

  const potenciaActualKw = Number(
    (datosCarga.potenciaMaximaKw * (0.82 + Math.random() * 0.15)).toFixed(1),
  );

  const nuevaCarga: Carga = {
    ...datosCarga,

    id: generarId(),
    estado: "activa",

    fechaHoraFinReal: null,

    potenciaActualKw,
    energiaConsumidaKwh: 0,

    creadaEn: new Date().toISOString(),
  };

  guardarCargas([...cargas, nuevaCarga]);

  return nuevaCarga;
}

export async function finalizarCarga(cargaId: string): Promise<Carga> {
  await esperar(RETARDO_SIMULADO_MS);

  const cargas = leerCargasGuardadas();

  const cargaEncontrada = cargas.find((carga) => carga.id === cargaId);

  if (!cargaEncontrada) {
    throw new Error("No se ha encontrado la carga.");
  }

  if (cargaEncontrada.estado !== "activa") {
    throw new Error("La carga ya no está activa.");
  }

  const fechaHoraFinReal = new Date().toISOString();

  const cargaFinalizada: Carga = {
    ...cargaEncontrada,
    estado: "finalizada",
    fechaHoraFinReal,
    energiaConsumidaKwh: calcularEnergiaConsumida({
      ...cargaEncontrada,
      fechaHoraFinReal,
    }),
  };

  const cargasActualizadas = cargas.map((carga) =>
    carga.id === cargaId ? cargaFinalizada : carga,
  );

  guardarCargas(cargasActualizadas);

  return cargaFinalizada;
}

export async function cancelarCarga(cargaId: string): Promise<Carga> {
  await esperar(RETARDO_SIMULADO_MS);

  const cargas = leerCargasGuardadas();

  const cargaEncontrada = cargas.find((carga) => carga.id === cargaId);

  if (!cargaEncontrada) {
    throw new Error("No se ha encontrado la carga.");
  }

  if (cargaEncontrada.estado !== "activa") {
    throw new Error("La carga ya no está activa.");
  }

  const fechaHoraFinReal = new Date().toISOString();

  const cargaCancelada: Carga = {
    ...cargaEncontrada,
    estado: "cancelada",
    fechaHoraFinReal,
    energiaConsumidaKwh: calcularEnergiaConsumida({
      ...cargaEncontrada,
      fechaHoraFinReal,
    }),
  };

  const cargasActualizadas = cargas.map((carga) =>
    carga.id === cargaId ? cargaCancelada : carga,
  );

  guardarCargas(cargasActualizadas);

  return cargaCancelada;
}

export function calcularEnergiaTotal(cargas: Carga[]) {
  return Number(
    cargas
      .reduce((total, carga) => total + carga.energiaConsumidaKwh, 0)
      .toFixed(2),
  );
}
