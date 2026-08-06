import type {
  DatosNuevaReserva,
  EstadoReserva,
  Reserva,
  ReservaConFechas,
} from "../types/reservation";

const CLAVE_RESERVAS = "cargaquer_reservas";
const RETARDO_SIMULADO_MS = 300;

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

  return `reserva-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function crearFechaHora(fecha: string, hora: string) {
  return new Date(`${fecha}T${hora}:00`);
}

function convertirFechaAValor(fecha: Date) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function convertirFechaAHora(fecha: Date) {
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${horas}:${minutos}`;
}

function calcularFechaHoraFin(
  fecha: string,
  horaInicio: string,
  duracionMinutos: number,
) {
  const fechaHoraFin = crearFechaHora(fecha, horaInicio);

  fechaHoraFin.setMinutes(fechaHoraFin.getMinutes() + duracionMinutos);

  return {
    fechaFin: convertirFechaAValor(fechaHoraFin),
    horaFin: convertirFechaAHora(fechaHoraFin),
    fechaHoraFin,
  };
}

function normalizarReserva(reserva: Partial<Reserva>): Reserva | null {
  if (
    !reserva.id ||
    !reserva.usuarioId ||
    !reserva.cargadorId ||
    !reserva.tomaId ||
    !reserva.fecha ||
    !reserva.horaInicio ||
    typeof reserva.duracionMinutos !== "number"
  ) {
    return null;
  }

  /*
   * Esto permite conservar las reservas antiguas que ya
   * estaban guardadas antes de añadir fechaFin.
   */
  const datosFin = calcularFechaHoraFin(
    reserva.fecha,
    reserva.horaInicio,
    reserva.duracionMinutos,
  );

  return {
    id: reserva.id,
    usuarioId: reserva.usuarioId,
    cargadorId: reserva.cargadorId,
    tomaId: reserva.tomaId,
    fecha: reserva.fecha,
    horaInicio: reserva.horaInicio,
    duracionMinutos: reserva.duracionMinutos,

    fechaFin: reserva.fechaFin ?? datosFin.fechaFin,
    horaFin: reserva.horaFin ?? datosFin.horaFin,

    creadaEn: reserva.creadaEn ?? new Date().toISOString(),

    estado: reserva.estado ?? "confirmada",
  };
}

function leerReservasGuardadas(): Reserva[] {
  try {
    const reservasGuardadas = localStorage.getItem(CLAVE_RESERVAS);

    if (!reservasGuardadas) {
      return [];
    }

    const resultado = JSON.parse(reservasGuardadas);

    if (!Array.isArray(resultado)) {
      return [];
    }

    const reservasNormalizadas = resultado
      .map((reserva) => normalizarReserva(reserva as Partial<Reserva>))
      .filter((reserva): reserva is Reserva => reserva !== null);

    /*
     * Guardamos otra vez para migrar automáticamente
     * las reservas antiguas que no tenían fechaFin.
     */
    guardarReservas(reservasNormalizadas);

    return reservasNormalizadas;
  } catch {
    return [];
  }
}

function guardarReservas(reservas: Reserva[]) {
  localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas));
}

function obtenerInicioReserva(reserva: Reserva) {
  return crearFechaHora(reserva.fecha, reserva.horaInicio);
}

function obtenerFinReserva(reserva: Reserva) {
  return crearFechaHora(reserva.fechaFin, reserva.horaFin);
}

function calcularEstadoActual(reserva: Reserva): EstadoReserva {
  if (reserva.estado === "cancelada") {
    return "cancelada";
  }

  const ahora = new Date();
  const fechaHoraInicio = obtenerInicioReserva(reserva);
  const fechaHoraFin = obtenerFinReserva(reserva);

  if (ahora >= fechaHoraInicio && ahora < fechaHoraFin) {
    return "activa";
  }

  if (ahora >= fechaHoraFin) {
    return "finalizada";
  }

  return "confirmada";
}

function actualizarEstados(reservas: Reserva[]): Reserva[] {
  let hayCambios = false;

  const reservasActualizadas = reservas.map((reserva) => {
    const estadoActual = calcularEstadoActual(reserva);

    if (estadoActual === reserva.estado) {
      return reserva;
    }

    hayCambios = true;

    return {
      ...reserva,
      estado: estadoActual,
    };
  });

  if (hayCambios) {
    guardarReservas(reservasActualizadas);
  }

  return reservasActualizadas;
}

function convertirReservaConFechas(reserva: Reserva): ReservaConFechas {
  return {
    ...reserva,
    fechaHoraInicio: obtenerInicioReserva(reserva),
    fechaHoraFin: obtenerFinReserva(reserva),
  };
}

function reservasSeSolapan(
  inicioA: Date,
  finA: Date,
  inicioB: Date,
  finB: Date,
) {
  return (
    inicioA.getTime() < finB.getTime() && finA.getTime() > inicioB.getTime()
  );
}

export async function obtenerReservas(): Promise<Reserva[]> {
  await esperar(RETARDO_SIMULADO_MS);

  return actualizarEstados(leerReservasGuardadas());
}

export async function obtenerReservasUsuario(
  usuarioId: string,
): Promise<Reserva[]> {
  const reservas = await obtenerReservas();

  return reservas
    .filter((reserva) => reserva.usuarioId === usuarioId)
    .sort(
      (reservaA, reservaB) =>
        obtenerInicioReserva(reservaA).getTime() -
        obtenerInicioReserva(reservaB).getTime(),
    );
}

export async function obtenerReservasToma(
  cargadorId: string,
  tomaId: string,
): Promise<Reserva[]> {
  const reservas = await obtenerReservas();

  return reservas.filter(
    (reserva) =>
      reserva.cargadorId === cargadorId &&
      reserva.tomaId === tomaId &&
      reserva.estado !== "cancelada" &&
      reserva.estado !== "finalizada" &&
      reserva.estado !== "caducada",
  );
}

export async function crearReserva(
  datosReserva: DatosNuevaReserva,
): Promise<Reserva> {
  await esperar(RETARDO_SIMULADO_MS);

  const reservas = actualizarEstados(leerReservasGuardadas());

  const fechaHoraInicio = crearFechaHora(
    datosReserva.fecha,
    datosReserva.horaInicio,
  );

  const datosFin = calcularFechaHoraFin(
    datosReserva.fecha,
    datosReserva.horaInicio,
    datosReserva.duracionMinutos,
  );

  const reservaSolapada = reservas.find((reserva) => {
    if (
      reserva.cargadorId !== datosReserva.cargadorId ||
      reserva.tomaId !== datosReserva.tomaId ||
      reserva.estado === "cancelada" ||
      reserva.estado === "finalizada" ||
      reserva.estado === "caducada"
    ) {
      return false;
    }

    return reservasSeSolapan(
      fechaHoraInicio,
      datosFin.fechaHoraFin,
      obtenerInicioReserva(reserva),
      obtenerFinReserva(reserva),
    );
  });

  if (reservaSolapada) {
    throw new Error(
      `La toma ya está reservada desde las ${reservaSolapada.horaInicio} hasta las ${reservaSolapada.horaFin}.`,
    );
  }

  const nuevaReserva: Reserva = {
    ...datosReserva,

    id: generarId(),

    fechaFin: datosFin.fechaFin,
    horaFin: datosFin.horaFin,

    creadaEn: new Date().toISOString(),
    estado: "confirmada",
  };

  guardarReservas([...reservas, nuevaReserva]);

  return nuevaReserva;
}

export async function cancelarReserva(
  reservaId: string,
  usuarioId: string,
): Promise<Reserva> {
  await esperar(RETARDO_SIMULADO_MS);

  const reservas = leerReservasGuardadas();

  const reservaEncontrada = reservas.find(
    (reserva) => reserva.id === reservaId && reserva.usuarioId === usuarioId,
  );

  if (!reservaEncontrada) {
    throw new Error("No se ha encontrado la reserva.");
  }

  if (
    reservaEncontrada.estado === "activa" ||
    reservaEncontrada.estado === "finalizada"
  ) {
    throw new Error("Esta reserva ya no puede cancelarse.");
  }

  const reservaCancelada: Reserva = {
    ...reservaEncontrada,
    estado: "cancelada",
  };

  const reservasActualizadas = reservas.map((reserva) =>
    reserva.id === reservaId ? reservaCancelada : reserva,
  );

  guardarReservas(reservasActualizadas);

  return reservaCancelada;
}

export async function obtenerReservaActivaDelCargador(
  usuarioId: string,
  cargadorId: string,
): Promise<ReservaConFechas | null> {
  const reservas = await obtenerReservasUsuario(usuarioId);

  const ahora = new Date();

  const reservaEncontrada = reservas
    .filter(
      (reserva) =>
        reserva.cargadorId === cargadorId &&
        reserva.estado !== "cancelada" &&
        reserva.estado !== "finalizada" &&
        reserva.estado !== "caducada",
    )
    .map(convertirReservaConFechas)
    .find((reserva) => reserva.fechaHoraFin.getTime() > ahora.getTime());

  return reservaEncontrada ?? null;
}

export function puedeIniciarCarga(reserva: Reserva, fechaActual = new Date()) {
  if (
    reserva.estado === "cancelada" ||
    reserva.estado === "finalizada" ||
    reserva.estado === "caducada"
  ) {
    return false;
  }

  const fechaHoraInicio = obtenerInicioReserva(reserva);

  const fechaHoraFin = obtenerFinReserva(reserva);

  return fechaActual >= fechaHoraInicio && fechaActual < fechaHoraFin;
}

export function obtenerFechaHoraInicio(reserva: Reserva) {
  return obtenerInicioReserva(reserva);
}

export function obtenerFechaHoraFin(reserva: Reserva) {
  return obtenerFinReserva(reserva);
}
