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

function guardarReservas(reservas: Reserva[]) {
  localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas));
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

    guardarReservas(reservasNormalizadas);

    return reservasNormalizadas;
  } catch {
    return [];
  }
}

function obtenerInicioReserva(reserva: Reserva) {
  return crearFechaHora(reserva.fecha, reserva.horaInicio);
}

function obtenerFinReserva(reserva: Reserva) {
  return crearFechaHora(reserva.fechaFin, reserva.horaFin);
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

function calcularEstadoActual(reserva: Reserva): EstadoReserva {
  if (
    reserva.estado === "cancelada" ||
    reserva.estado === "finalizada" ||
    reserva.estado === "caducada"
  ) {
    return reserva.estado;
  }

  const ahora = new Date();
  const fechaHoraFin = obtenerFinReserva(reserva);

  /*
   * Una reserva solamente pasa a activa cuando el usuario
   * pulsa el botón "Iniciar carga".
   */
  if (reserva.estado === "activa") {
    if (ahora.getTime() >= fechaHoraFin.getTime()) {
      return "finalizada";
    }

    return "activa";
  }

  /*
   * Si la reserva termina sin que se haya iniciado una carga,
   * queda caducada, no finalizada.
   */
  if (
    reserva.estado === "confirmada" &&
    ahora.getTime() >= fechaHoraFin.getTime()
  ) {
    return "caducada";
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

function reservaSigueVigente(reserva: Reserva) {
  return (
    reserva.estado !== "cancelada" &&
    reserva.estado !== "finalizada" &&
    reserva.estado !== "caducada"
  );
}

export async function obtenerReservas(): Promise<Reserva[]> {
  await esperar(RETARDO_SIMULADO_MS);

  return actualizarEstados(leerReservasGuardadas());
}

export async function obtenerReservaPorId(
  reservaId: string,
  usuarioId?: string,
): Promise<Reserva | null> {
  const reservas = await obtenerReservas();

  const reservaEncontrada = reservas.find(
    (reserva) =>
      reserva.id === reservaId &&
      (!usuarioId || reserva.usuarioId === usuarioId),
  );

  return reservaEncontrada ?? null;
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
      reservaSigueVigente(reserva),
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

  /*
   * Primera comprobación:
   * la toma no puede estar reservada por ningún usuario
   * durante ese horario.
   */
  const reservaSolapadaEnToma = reservas.find((reserva) => {
    if (
      reserva.cargadorId !== datosReserva.cargadorId ||
      reserva.tomaId !== datosReserva.tomaId ||
      !reservaSigueVigente(reserva)
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

  if (reservaSolapadaEnToma) {
    throw new Error(
      `Esta toma ya está reservada desde las ${reservaSolapadaEnToma.horaInicio} hasta las ${reservaSolapadaEnToma.horaFin}.`,
    );
  }

  /*
   * Segunda comprobación:
   * un mismo usuario no puede tener dos reservas
   * simultáneas, aunque sean cargadores o tomas distintas.
   */
  const reservaSolapadaDelUsuario = reservas.find((reserva) => {
    if (
      reserva.usuarioId !== datosReserva.usuarioId ||
      !reservaSigueVigente(reserva)
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

  if (reservaSolapadaDelUsuario) {
    throw new Error(
      `Ya tienes otra reserva entre las ${reservaSolapadaDelUsuario.horaInicio} y las ${reservaSolapadaDelUsuario.horaFin}. No puedes reservar dos tomas al mismo tiempo.`,
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

  const reservas = actualizarEstados(leerReservasGuardadas());

  const reservaEncontrada = reservas.find(
    (reserva) => reserva.id === reservaId && reserva.usuarioId === usuarioId,
  );

  if (!reservaEncontrada) {
    throw new Error("No se ha encontrado la reserva.");
  }

  if (
    reservaEncontrada.estado === "activa" ||
    reservaEncontrada.estado === "finalizada" ||
    reservaEncontrada.estado === "caducada"
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

export async function marcarReservaComoActiva(
  reservaId: string,
  usuarioId: string,
): Promise<Reserva> {
  await esperar(RETARDO_SIMULADO_MS);

  const reservas = actualizarEstados(leerReservasGuardadas());

  const reservaEncontrada = reservas.find(
    (reserva) => reserva.id === reservaId && reserva.usuarioId === usuarioId,
  );

  if (!reservaEncontrada) {
    throw new Error("No se ha encontrado la reserva.");
  }

  if (reservaEncontrada.estado !== "confirmada") {
    throw new Error("Esta reserva no puede iniciarse.");
  }

  const ahora = new Date();
  const inicio = obtenerInicioReserva(reservaEncontrada);
  const fin = obtenerFinReserva(reservaEncontrada);

  if (ahora.getTime() < inicio.getTime() || ahora.getTime() >= fin.getTime()) {
    throw new Error("La reserva todavía no está dentro de su horario.");
  }

  const reservaActiva: Reserva = {
    ...reservaEncontrada,
    estado: "activa",
  };

  const reservasActualizadas = reservas.map((reserva) =>
    reserva.id === reservaId ? reservaActiva : reserva,
  );

  guardarReservas(reservasActualizadas);

  return reservaActiva;
}

export async function marcarReservaComoFinalizada(
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

  if (reservaEncontrada.estado !== "activa") {
    throw new Error("Esta reserva no tiene una carga activa.");
  }

  const reservaFinalizada: Reserva = {
    ...reservaEncontrada,
    estado: "finalizada",
  };

  const reservasActualizadas = reservas.map((reserva) =>
    reserva.id === reservaId ? reservaFinalizada : reserva,
  );

  guardarReservas(reservasActualizadas);

  return reservaFinalizada;
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
        reserva.cargadorId === cargadorId && reservaSigueVigente(reserva),
    )
    .map(convertirReservaConFechas)
    .find((reserva) => reserva.fechaHoraFin.getTime() > ahora.getTime());

  return reservaEncontrada ?? null;
}

export function puedeIniciarCarga(reserva: Reserva, fechaActual = new Date()) {
  if (reserva.estado !== "confirmada") {
    return false;
  }

  const fechaHoraInicio = obtenerInicioReserva(reserva);

  const fechaHoraFin = obtenerFinReserva(reserva);

  return (
    fechaActual.getTime() >= fechaHoraInicio.getTime() &&
    fechaActual.getTime() < fechaHoraFin.getTime()
  );
}

export function obtenerFechaHoraInicio(reserva: Reserva) {
  return obtenerInicioReserva(reserva);
}

export function obtenerFechaHoraFin(reserva: Reserva) {
  return obtenerFinReserva(reserva);
}
