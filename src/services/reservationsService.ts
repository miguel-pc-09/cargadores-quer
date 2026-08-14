import { supabase } from "./supabaseClient";

import { puedeUsuarioReservar } from "./usersService";

import type {
  DatosNuevaReserva,
  EstadoReserva,
  Reserva,
  ReservaConFechas,
} from "../types/reservation";

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

function crearFechaHora(fecha: string, hora: string) {
  const horaNormalizada = normalizarHora(hora);

  return new Date(`${fecha}T${horaNormalizada}:00`);
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

function normalizarHora(hora: string) {
  return hora.slice(0, 5);
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

function calcularFechaFinDesdeBaseDatos(
  fecha: string,
  horaInicio: string,
  horaFin: string,
) {
  const inicio = crearFechaHora(fecha, horaInicio);

  const fin = crearFechaHora(fecha, horaFin);

  /*
   * Si la hora final es igual o anterior a la inicial,
   * significa que la reserva termina al día siguiente.
   *
   * Ejemplo:
   * 23:00 -> 01:00
   */
  if (fin.getTime() <= inicio.getTime()) {
    fin.setDate(fin.getDate() + 1);
  }

  return fin;
}

function calcularDuracionDesdeBaseDatos(
  fecha: string,
  horaInicio: string,
  horaFin: string,
) {
  const inicio = crearFechaHora(fecha, horaInicio);

  const fin = calcularFechaFinDesdeBaseDatos(fecha, horaInicio, horaFin);

  return Math.round((fin.getTime() - inicio.getTime()) / 60_000);
}

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

  if (reserva.estado === "activa") {
    if (ahora.getTime() >= fechaHoraFin.getTime()) {
      return "finalizada";
    }

    return "activa";
  }

  if (
    reserva.estado === "confirmada" &&
    ahora.getTime() >= fechaHoraFin.getTime()
  ) {
    return "caducada";
  }

  return "confirmada";
}

async function actualizarEstados(reservas: Reserva[]): Promise<Reserva[]> {
  const reservasActualizadas = await Promise.all(
    reservas.map(async (reserva): Promise<Reserva> => {
      const estadoActual = calcularEstadoActual(reserva);

      if (estadoActual === reserva.estado) {
        return reserva;
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

export async function obtenerReservas(): Promise<Reserva[]> {
  const reservas = await leerReservasBaseDatos();

  return actualizarEstados(reservas);
}

export async function obtenerReservaPorId(
  reservaId: string,
  usuarioId?: string,
): Promise<Reserva | null> {
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

  const reservas = ((data ?? []) as ReservaBaseDatos[]).map(
    convertirReservaBaseDatos,
  );

  return actualizarEstados(reservas);
}

export async function obtenerReservasToma(
  cargadorId: string,
  tomaId: string,
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

  const reservas = ((data ?? []) as ReservaBaseDatos[]).map(
    convertirReservaBaseDatos,
  );

  const actualizadas = await actualizarEstados(reservas);

  return actualizadas.filter(reservaSigueVigente);
}

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

  if (fechaHoraInicio.getTime() < Date.now()) {
    throw new Error(
      "No puedes realizar una reserva en un horario que ya ha pasado.",
    );
  }

  const datosFin = calcularFechaHoraFin(
    datosReserva.fecha,
    datosReserva.horaInicio,
    datosReserva.duracionMinutos,
  );

  /*
   * Consultamos las reservas vigentes.
   * Aquí ya vienen desde Supabase.
   */
  const reservas = await obtenerReservas();

  /*
   * Primera comprobación:
   * ninguna otra reserva puede ocupar esta toma
   * durante el mismo horario.
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
   * el mismo usuario no puede tener dos reservas
   * simultáneas aunque sean en cargadores diferentes.
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

  const fin = obtenerFinReserva(reservaEncontrada);

  if (ahora.getTime() < inicio.getTime() || ahora.getTime() >= fin.getTime()) {
    throw new Error("La reserva todavía no está dentro de su horario.");
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
