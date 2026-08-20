import { supabase } from "./supabaseClient";

import { puedeUsuarioReservar } from "./usersService";

import { obtenerCargadores } from "./chargersService";

import { cargadoresSimulados } from "../data/cargadores";

import type {
  DatosNuevaReserva,
  EstadoReserva,
  Reserva,
  ReservaConFechas,
} from "../types/reservation";

// Estructura de una reserva en la base de datos.
interface ReservaBaseDatos {
  id: string;
  usuario_id: string;
  cargador_id: string;
  toma_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoReserva;
  creada_en: string;
  actualizada_en: string | null;
}

// Crea una fecha completa con día y hora.
function crearFechaHora(fecha: string, hora: string) {
  const horaNormalizada = normalizarHora(hora);

  return new Date(`${fecha}T${horaNormalizada}:00`);
}

// Convierte una fecha al formato YYYY-MM-DD.
function convertirFechaAValor(fecha: Date) {
  const anio = fecha.getFullYear();

  const mes = String(fecha.getMonth() + 1).padStart(2, "0");

  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

// Convierte una fecha al formato HH:MM.
function convertirFechaAHora(fecha: Date) {
  const horas = String(fecha.getHours()).padStart(2, "0");

  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${horas}:${minutos}`;
}

// Normaliza una hora.
function normalizarHora(hora: string) {
  return hora.slice(0, 5);
}

// Calcula el final de una reserva.
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

// Calcula la fecha final desde la base de datos.
function calcularFechaFinDesdeBaseDatos(
  fecha: string,
  horaInicio: string,
  horaFin: string,
) {
  const inicio = crearFechaHora(fecha, horaInicio);

  const fin = crearFechaHora(fecha, horaFin);

  if (fin.getTime() <= inicio.getTime()) {
    fin.setDate(fin.getDate() + 1);
  }

  return fin;
}

// Calcula la duración guardada en la base de datos.
function calcularDuracionDesdeBaseDatos(
  fecha: string,
  horaInicio: string,
  horaFin: string,
) {
  const inicio = crearFechaHora(fecha, horaInicio);

  const fin = calcularFechaFinDesdeBaseDatos(fecha, horaInicio, horaFin);

  return Math.round((fin.getTime() - inicio.getTime()) / 60_000);
}

// Convierte una reserva de Supabase.
function convertirReservaBaseDatos(reserva: ReservaBaseDatos): Reserva {
  const horaInicio = normalizarHora(reserva.hora_inicio);

  const horaFin = normalizarHora(reserva.hora_fin);

  const fechaHoraFin = calcularFechaFinDesdeBaseDatos(
    reserva.fecha,
    horaInicio,
    horaFin,
  );

  const duracionMinutos = calcularDuracionDesdeBaseDatos(
    reserva.fecha,
    horaInicio,
    horaFin,
  );

  return {
    id: reserva.id,

    usuarioId: reserva.usuario_id,

    cargadorId: reserva.cargador_id,

    tomaId: reserva.toma_id,

    fecha: reserva.fecha,

    horaInicio,

    duracionMinutos,

    fechaFin: convertirFechaAValor(fechaHoraFin),

    horaFin,

    creadaEn: reserva.creada_en,

    estado: reserva.estado,
  };
}

// Obtiene el inicio de una reserva.
function obtenerInicioReserva(reserva: Reserva) {
  return crearFechaHora(reserva.fecha, reserva.horaInicio);
}

// Obtiene el final de una reserva.
function obtenerFinReserva(reserva: Reserva) {
  return crearFechaHora(reserva.fechaFin, reserva.horaFin);
}

// Comprueba si dos reservas se solapan.
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

// Calcula el estado actual de una reserva.
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

  if (reserva.estado === "activa") {
    if (ahora.getTime() >= fechaHoraFin.getTime()) {
      return "finalizada";
    }

    return "activa";
  }

  if (reserva.estado === "confirmada") {
    const fechaHoraInicio = obtenerInicioReserva(reserva);

    const fechaCreacion = new Date(reserva.creadaEn);

    const inicioMargen = Number.isNaN(fechaCreacion.getTime())
      ? fechaHoraInicio.getTime()
      : Math.max(fechaHoraInicio.getTime(), fechaCreacion.getTime());

    const limiteInicio = new Date(inicioMargen + 15 * 60_000);

    if (ahora.getTime() >= limiteInicio.getTime()) {
      return "caducada";
    }
  }

  return "confirmada";
}

// Actualiza automáticamente los estados.
async function actualizarEstados(reservas: Reserva[]): Promise<Reserva[]> {
  const reservasActualizadas = await Promise.all(
    reservas.map(async (reserva): Promise<Reserva> => {
      const estadoActual = calcularEstadoActual(reserva);

      if (estadoActual === reserva.estado) {
        return reserva;
      }

      if (reserva.id.startsWith("demo-reserva-")) {
        return {
          ...reserva,
          estado: estadoActual,
        };
      }

      const { error } = await supabase
        .from("reservas")
        .update({
          estado: estadoActual,

          actualizada_en: new Date().toISOString(),
        })
        .eq("id", reserva.id);

      if (error) {
        console.error(
          `No se ha podido actualizar automáticamente la reserva ${reserva.id}:`,
          error,
        );

        return reserva;
      }

      return {
        ...reserva,

        estado: estadoActual,
      };
    }),
  );

  return reservasActualizadas;
}

// Añade las fechas completas a una reserva.
function convertirReservaConFechas(reserva: Reserva): ReservaConFechas {
  return {
    ...reserva,

    fechaHoraInicio: obtenerInicioReserva(reserva),

    fechaHoraFin: obtenerFinReserva(reserva),
  };
}

// Comprueba si una reserva sigue vigente.
function reservaSigueVigente(reserva: Reserva) {
  return (
    reserva.estado !== "cancelada" &&
    reserva.estado !== "finalizada" &&
    reserva.estado !== "caducada"
  );
}

// Normaliza un texto para compararlo.
function normalizarTexto(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Busca un cargador simulado por nombre.
function buscarCargadorSimuladoPorNombre(nombre: string) {
  const nombreNormalizado = normalizarTexto(nombre);

  return cargadoresSimulados.find(
    (cargador) => normalizarTexto(cargador.nombre) === nombreNormalizado,
  );
}

// Crea una reserva de demostración.
function crearReservaDemostracion(
  cargadorId: string,
  tomaId: string,
  fecha: string,
  horaInicio: string,
  duracionMinutos: number,
  numero: number,
): Reserva {
  const datosFin = calcularFechaHoraFin(fecha, horaInicio, duracionMinutos);

  return {
    id: `demo-reserva-${numero}`,

    usuarioId: `demo-usuario-${numero}`,

    cargadorId,

    tomaId,

    fecha,

    horaInicio,

    duracionMinutos,

    fechaFin: datosFin.fechaFin,

    horaFin: datosFin.horaFin,

    creadaEn: new Date().toISOString(),

    estado: "confirmada",
  };
}

// Obtiene las reservas de demostración.
async function obtenerReservasDemostracion(
  cargadorId: string,
  tomaId: string,
  fecha: string,
): Promise<Reserva[]> {
  const cargadores = await obtenerCargadores();

  const cargador = cargadores.find((item) => item.id === cargadorId);

  if (!cargador) {
    return [];
  }

  const cargadorSimulado = buscarCargadorSimuladoPorNombre(cargador.nombre);

  if (!cargadorSimulado) {
    return [];
  }

  const tomaReal = cargador.tomas.find((toma) => toma.id === tomaId);

  if (!tomaReal) {
    return [];
  }

  const tomaSimulada = cargadorSimulado.tomas.find(
    (toma) => normalizarTexto(toma.nombre) === normalizarTexto(tomaReal.nombre),
  );

  if (!tomaSimulada) {
    return [];
  }

  if (
    normalizarTexto(cargadorSimulado.nombre) === "enebros" &&
    normalizarTexto(tomaSimulada.nombre) === "toma 2"
  ) {
    return [
      crearReservaDemostracion(cargadorId, tomaId, fecha, "10:00", 120, 1),
    ];
  }

  if (
    normalizarTexto(cargadorSimulado.nombre) === "piscina" &&
    normalizarTexto(tomaSimulada.nombre) === "toma 1"
  ) {
    return [
      crearReservaDemostracion(cargadorId, tomaId, fecha, "11:00", 120, 2),
    ];
  }

  if (
    normalizarTexto(cargadorSimulado.nombre) === "paez de castro" &&
    normalizarTexto(tomaSimulada.nombre) === "toma 2"
  ) {
    return [
      crearReservaDemostracion(cargadorId, tomaId, fecha, "16:00", 120, 3),
    ];
  }

  return [];
}

// Obtiene todas las reservas de una toma.
async function obtenerReservasDeTomaCompletas(
  cargadorId: string,
  tomaId: string,
  fecha?: string,
): Promise<Reserva[]> {
  const { data, error } = await supabase
    .from("reservas")
    .select(
      `
        id,
        usuario_id,
        cargador_id,
        toma_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        creada_en,
        actualizada_en
      `,
    )
    .eq("cargador_id", cargadorId)
    .eq("toma_id", tomaId)
    .in("estado", ["confirmada", "activa"]);

  if (error) {
    throw new Error(
      `No se han podido cargar las reservas de esta toma: ${error.message}`,
    );
  }

  let reservas = ((data ?? []) as ReservaBaseDatos[]).map(
    convertirReservaBaseDatos,
  );

  if (fecha) {
    const reservasDemo = await obtenerReservasDemostracion(
      cargadorId,
      tomaId,
      fecha,
    );

    reservas = [...reservas, ...reservasDemo];
  }

  return actualizarEstados(reservas);
}

// Lee todas las reservas de Supabase.
async function leerReservasBaseDatos(): Promise<Reserva[]> {
  const { data, error } = await supabase.from("reservas").select(
    `
        id,
        usuario_id,
        cargador_id,
        toma_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        creada_en,
        actualizada_en
      `,
  );

  if (error) {
    throw new Error(`No se han podido cargar las reservas: ${error.message}`);
  }

  return ((data ?? []) as ReservaBaseDatos[]).map(convertirReservaBaseDatos);
}

// Obtiene todas las reservas.
export async function obtenerReservas(): Promise<Reserva[]> {
  const reservas = await leerReservasBaseDatos();

  return actualizarEstados(reservas);
}

// Obtiene una reserva por su ID.
export async function obtenerReservaPorId(
  reservaId: string,
  usuarioId?: string,
): Promise<Reserva | null> {
  if (reservaId.startsWith("demo-reserva-")) {
    return null;
  }

  let consulta = supabase
    .from("reservas")
    .select(
      `
        id,
        usuario_id,
        cargador_id,
        toma_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        creada_en,
        actualizada_en
      `,
    )
    .eq("id", reservaId);

  if (usuarioId) {
    consulta = consulta.eq("usuario_id", usuarioId);
  }

  const { data, error } = await consulta.maybeSingle();

  if (error) {
    throw new Error(`No se ha podido cargar la reserva: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const reserva = convertirReservaBaseDatos(data as ReservaBaseDatos);

  const [reservaActualizada] = await actualizarEstados([reserva]);

  return reservaActualizada ?? null;
}

// Obtiene las reservas de un usuario.
export async function obtenerReservasUsuario(
  usuarioId: string,
): Promise<Reserva[]> {
  const { data, error } = await supabase
    .from("reservas")
    .select(
      `
        id,
        usuario_id,
        cargador_id,
        toma_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        creada_en,
        actualizada_en
      `,
    )
    .eq("usuario_id", usuarioId)
    .order("fecha", {
      ascending: true,
    })
    .order("hora_inicio", {
      ascending: true,
    });

  if (error) {
    throw new Error(`No se han podido cargar tus reservas: ${error.message}`);
  }

  const reservas = (data ?? []) as ReservaBaseDatos[];

  return actualizarEstados(reservas.map(convertirReservaBaseDatos));
}

// Obtiene las reservas vigentes de una toma.
export async function obtenerReservasToma(
  cargadorId: string,
  tomaId: string,
  fecha?: string,
): Promise<Reserva[]> {
  const reservas = await obtenerReservasDeTomaCompletas(
    cargadorId,
    tomaId,
    fecha,
  );

  return reservas.filter(reservaSigueVigente);
}

// Crea una nueva reserva.
export async function crearReserva(
  datosReserva: DatosNuevaReserva,
): Promise<Reserva> {
  const usuarioPuedeReservar = await puedeUsuarioReservar(
    datosReserva.usuarioId,
  );

  if (!usuarioPuedeReservar) {
    throw new Error(
      "Tu vehículo debe estar validado por el Ayuntamiento antes de poder realizar una reserva.",
    );
  }

  if (
    datosReserva.duracionMinutos < 30 ||
    datosReserva.duracionMinutos > 4 * 60 ||
    datosReserva.duracionMinutos % 30 !== 0
  ) {
    throw new Error(
      "La duración de la reserva debe estar comprendida entre 30 minutos y 4 horas, en bloques de 30 minutos.",
    );
  }

  const fechaHoraInicio = crearFechaHora(
    datosReserva.fecha,
    datosReserva.horaInicio,
  );

  const finPrimerBloque = new Date(fechaHoraInicio.getTime() + 30 * 60_000);

  if (finPrimerBloque.getTime() <= Date.now()) {
    throw new Error(
      "No puedes realizar una reserva en un bloque horario que ya ha finalizado.",
    );
  }

  const datosFin = calcularFechaHoraFin(
    datosReserva.fecha,
    datosReserva.horaInicio,
    datosReserva.duracionMinutos,
  );

  const reservas = await obtenerReservasToma(
    datosReserva.cargadorId,
    datosReserva.tomaId,
    datosReserva.fecha,
  );

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
    if (reservaSolapadaEnToma.id.startsWith("demo-reserva-")) {
      throw new Error(
        `Este horario está ocupado por otro usuario. La toma está reservada desde las ${reservaSolapadaEnToma.horaInicio} hasta las ${reservaSolapadaEnToma.horaFin}.`,
      );
    }

    throw new Error(
      `Esta toma ya está reservada desde las ${reservaSolapadaEnToma.horaInicio} hasta las ${reservaSolapadaEnToma.horaFin}.`,
    );
  }

  const reservasUsuario = await obtenerReservasUsuario(datosReserva.usuarioId);

  const reservaSolapadaDelUsuario = reservasUsuario.find((reserva) => {
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

  const ahora = new Date().toISOString();

  const { data, error } = await supabase
    .from("reservas")
    .insert({
      usuario_id: datosReserva.usuarioId,

      cargador_id: datosReserva.cargadorId,

      toma_id: datosReserva.tomaId,

      fecha: datosReserva.fecha,

      hora_inicio: datosReserva.horaInicio,

      hora_fin: datosFin.horaFin,

      estado: "confirmada",

      creada_en: ahora,

      actualizada_en: ahora,
    })
    .select(
      `
          id,
          usuario_id,
          cargador_id,
          toma_id,
          fecha,
          hora_inicio,
          hora_fin,
          estado,
          creada_en,
          actualizada_en
        `,
    )
    .single();

  if (error) {
    throw new Error(`No se ha podido crear la reserva: ${error.message}`);
  }

  return convertirReservaBaseDatos(data as ReservaBaseDatos);
}

// Cancela una reserva futura.
export async function cancelarReserva(
  reservaId: string,
  usuarioId: string,
): Promise<Reserva> {
  const reservaEncontrada = await obtenerReservaPorId(reservaId, usuarioId);

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

  const inicio = obtenerInicioReserva(reservaEncontrada);

  if (Date.now() >= inicio.getTime()) {
    throw new Error("La reserva ya ha comenzado y no puede cancelarse.");
  }

  const { data, error } = await supabase
    .from("reservas")
    .update({
      estado: "cancelada",

      actualizada_en: new Date().toISOString(),
    })
    .eq("id", reservaId)
    .eq("usuario_id", usuarioId)
    .select(
      `
          id,
          usuario_id,
          cargador_id,
          toma_id,
          fecha,
          hora_inicio,
          hora_fin,
          estado,
          creada_en,
          actualizada_en
        `,
    )
    .single();

  if (error) {
    throw new Error(`No se ha podido cancelar la reserva: ${error.message}`);
  }

  return convertirReservaBaseDatos(data as ReservaBaseDatos);
}

// Marca una reserva como activa.
export async function marcarReservaComoActiva(
  reservaId: string,
  usuarioId: string,
): Promise<Reserva> {
  const usuarioPuedeReservar = await puedeUsuarioReservar(usuarioId);

  if (!usuarioPuedeReservar) {
    throw new Error(
      "Tu vehículo debe estar validado por el Ayuntamiento antes de poder iniciar una carga.",
    );
  }

  const reservaEncontrada = await obtenerReservaPorId(reservaId, usuarioId);

  if (!reservaEncontrada) {
    throw new Error("No se ha encontrado la reserva.");
  }

  if (reservaEncontrada.estado !== "confirmada") {
    throw new Error("Esta reserva no puede iniciarse.");
  }

  const ahora = new Date();

  const inicio = obtenerInicioReserva(reservaEncontrada);

  const fechaCreacion = new Date(reservaEncontrada.creadaEn);

  const inicioMargen = Number.isNaN(fechaCreacion.getTime())
    ? inicio.getTime()
    : Math.max(inicio.getTime(), fechaCreacion.getTime());

  const limiteInicio = new Date(inicioMargen + 15 * 60_000);

  if (
    ahora.getTime() < inicio.getTime() ||
    ahora.getTime() >= limiteInicio.getTime()
  ) {
    throw new Error(
      "La reserva solo puede iniciarse durante los primeros 15 minutos de su horario.",
    );
  }

  const { data, error } = await supabase
    .from("reservas")
    .update({
      estado: "activa",

      actualizada_en: new Date().toISOString(),
    })
    .eq("id", reservaId)
    .eq("usuario_id", usuarioId)
    .eq("estado", "confirmada")
    .select(
      `
          id,
          usuario_id,
          cargador_id,
          toma_id,
          fecha,
          hora_inicio,
          hora_fin,
          estado,
          creada_en,
          actualizada_en
        `,
    )
    .single();

  if (error) {
    throw new Error(`No se ha podido iniciar la reserva: ${error.message}`);
  }

  return convertirReservaBaseDatos(data as ReservaBaseDatos);
}

// Marca una reserva como finalizada.
export async function marcarReservaComoFinalizada(
  reservaId: string,
  usuarioId: string,
): Promise<Reserva> {
  const reservaEncontrada = await obtenerReservaPorId(reservaId, usuarioId);

  if (!reservaEncontrada) {
    throw new Error("No se ha encontrado la reserva.");
  }

  if (reservaEncontrada.estado !== "activa") {
    throw new Error("Esta reserva no tiene una carga activa.");
  }

  const { data, error } = await supabase
    .from("reservas")
    .update({
      estado: "finalizada",

      actualizada_en: new Date().toISOString(),
    })
    .eq("id", reservaId)
    .eq("usuario_id", usuarioId)
    .eq("estado", "activa")
    .select(
      `
          id,
          usuario_id,
          cargador_id,
          toma_id,
          fecha,
          hora_inicio,
          hora_fin,
          estado,
          creada_en,
          actualizada_en
        `,
    )
    .single();

  if (error) {
    throw new Error(`No se ha podido finalizar la reserva: ${error.message}`);
  }

  return convertirReservaBaseDatos(data as ReservaBaseDatos);
}

// Obtiene la próxima reserva de un cargador.
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
    .filter((reserva) => reserva.fechaHoraFin.getTime() > ahora.getTime())
    .sort(
      (reservaA, reservaB) =>
        reservaA.fechaHoraInicio.getTime() - reservaB.fechaHoraInicio.getTime(),
    )[0];

  return reservaEncontrada ?? null;
}

// Comprueba si una reserva puede iniciarse.
export function puedeIniciarCarga(reserva: Reserva, fechaActual = new Date()) {
  if (reserva.estado !== "confirmada") {
    return false;
  }

  const fechaHoraInicio = obtenerInicioReserva(reserva);

  const fechaCreacion = new Date(reserva.creadaEn);

  const inicioMargen = Number.isNaN(fechaCreacion.getTime())
    ? fechaHoraInicio.getTime()
    : Math.max(fechaHoraInicio.getTime(), fechaCreacion.getTime());

  const limiteInicio = new Date(inicioMargen + 15 * 60_000);

  return (
    fechaActual.getTime() >= fechaHoraInicio.getTime() &&
    fechaActual.getTime() < limiteInicio.getTime()
  );
}

// Devuelve la fecha de inicio.
export function obtenerFechaHoraInicio(reserva: Reserva) {
  return obtenerInicioReserva(reserva);
}

// Devuelve la fecha de finalización.
export function obtenerFechaHoraFin(reserva: Reserva) {
  return obtenerFinReserva(reserva);
}
