import { supabase } from "./supabaseClient";

import type { Carga, DatosNuevaCarga, EstadoCarga } from "../types/carga";

// Estructura de una carga en la base de datos.
interface CargaBaseDatos {
  id: string;
  usuario_id: string;
  reserva_id: string | null;
  cargador_id: string;
  toma_id: string;
  estado: string;
  fecha_hora_inicio: string;
  fecha_hora_fin_prevista: string | null;
  fecha_hora_fin_real: string | null;
  potencia_actual_kw: number | string | null;
  energia_consumida_kwh: number | string | null;
  coste_estimado: number | string | null;
  creada_en: string;
}

// Convierte el estado de una carga.
function convertirEstadoCarga(estado: string): EstadoCarga {
  switch (estado.trim().toLowerCase()) {
    case "activa":
      return "activa";

    case "finalizada":
      return "finalizada";

    case "cancelada":
      return "cancelada";

    default:
      return "finalizada";
  }
}

// Convierte una carga de Supabase.
function convertirCarga(carga: CargaBaseDatos): Carga {
  const fechaHoraFinPrevista =
    carga.fecha_hora_fin_prevista ??
    carga.fecha_hora_fin_real ??
    carga.fecha_hora_inicio;

  return {
    id: carga.id,

    usuarioId: carga.usuario_id,

    reservaId: carga.reserva_id ?? "",

    cargadorId: carga.cargador_id,

    tomaId: carga.toma_id,

    estado: convertirEstadoCarga(carga.estado),

    fechaHoraInicio: carga.fecha_hora_inicio,

    fechaHoraFinPrevista,

    fechaHoraFinReal: carga.fecha_hora_fin_real,

    potenciaMaximaKw: Number(carga.potencia_actual_kw) || 0,

    potenciaActualKw: Number(carga.potencia_actual_kw) || 0,

    energiaConsumidaKwh: Number(carga.energia_consumida_kwh) || 0,

    creadaEn: carga.creada_en,
  };
}

// Calcula la energía consumida.
function calcularEnergiaConsumida(carga: Carga) {
  const inicio = new Date(carga.fechaHoraInicio).getTime();

  const fin = carga.fechaHoraFinReal
    ? new Date(carga.fechaHoraFinReal).getTime()
    : Date.now();

  if (Number.isNaN(inicio) || Number.isNaN(fin)) {
    return carga.energiaConsumidaKwh;
  }

  const horasTranscurridas = Math.max(0, (fin - inicio) / 3_600_000);

  return Number((horasTranscurridas * carga.potenciaActualKw).toFixed(2));
}

// Actualiza la energía de una carga activa.
function actualizarEnergiaCargaActiva(carga: Carga): Carga {
  if (carga.estado !== "activa") {
    return carga;
  }

  return {
    ...carga,

    energiaConsumidaKwh: calcularEnergiaConsumida(carga),
  };
}

// Obtiene todas las cargas.
export async function obtenerCargas(): Promise<Carga[]> {
  const { data, error } = await supabase
    .from("cargas")
    .select(
      `
        id,
        usuario_id,
        reserva_id,
        cargador_id,
        toma_id,
        estado,
        fecha_hora_inicio,
        fecha_hora_fin_prevista,
        fecha_hora_fin_real,
        potencia_actual_kw,
        energia_consumida_kwh,
        coste_estimado,
        creada_en
      `,
    )
    .order("fecha_hora_inicio", {
      ascending: false,
    });

  if (error) {
    throw new Error(`No se han podido cargar las sesiones: ${error.message}`);
  }

  return ((data ?? []) as CargaBaseDatos[])
    .map(convertirCarga)
    .map(actualizarEnergiaCargaActiva);
}

// Obtiene las cargas de un usuario.
export async function obtenerCargasUsuario(
  usuarioId: string,
): Promise<Carga[]> {
  const { data, error } = await supabase
    .from("cargas")
    .select(
      `
        id,
        usuario_id,
        reserva_id,
        cargador_id,
        toma_id,
        estado,
        fecha_hora_inicio,
        fecha_hora_fin_prevista,
        fecha_hora_fin_real,
        potencia_actual_kw,
        energia_consumida_kwh,
        coste_estimado,
        creada_en
      `,
    )
    .eq("usuario_id", usuarioId)
    .order("fecha_hora_inicio", {
      ascending: false,
    });

  if (error) {
    throw new Error(`No se han podido cargar tus sesiones: ${error.message}`);
  }

  return ((data ?? []) as CargaBaseDatos[])
    .map(convertirCarga)
    .map(actualizarEnergiaCargaActiva);
}

// Obtiene una carga por su ID.
export async function obtenerCargaPorId(
  cargaId: string,
): Promise<Carga | null> {
  const { data, error } = await supabase
    .from("cargas")
    .select(
      `
        id,
        usuario_id,
        reserva_id,
        cargador_id,
        toma_id,
        estado,
        fecha_hora_inicio,
        fecha_hora_fin_prevista,
        fecha_hora_fin_real,
        potencia_actual_kw,
        energia_consumida_kwh,
        coste_estimado,
        creada_en
      `,
    )
    .eq("id", cargaId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido obtener la carga: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return actualizarEnergiaCargaActiva(convertirCarga(data as CargaBaseDatos));
}

// Obtiene una carga activa del usuario.
export async function obtenerCargaActiva(
  usuarioId: string,
  cargaId: string,
): Promise<Carga | null> {
  if (!usuarioId || !cargaId) {
    return null;
  }

  const { data, error } = await supabase
    .from("cargas")
    .select(
      `
        id,
        usuario_id,
        reserva_id,
        cargador_id,
        toma_id,
        estado,
        fecha_hora_inicio,
        fecha_hora_fin_prevista,
        fecha_hora_fin_real,
        potencia_actual_kw,
        energia_consumida_kwh,
        coste_estimado,
        creada_en
      `,
    )
    .eq("id", cargaId)
    .eq("usuario_id", usuarioId)
    .eq("estado", "activa")
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se ha podido obtener la carga activa: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  return actualizarEnergiaCargaActiva(convertirCarga(data as CargaBaseDatos));
}

// Busca una carga activa por reserva.
export async function obtenerCargaActivaPorReserva(
  reservaId: string,
): Promise<Carga | null> {
  if (!reservaId) {
    return null;
  }

  const { data, error } = await supabase
    .from("cargas")
    .select(
      `
        id,
        usuario_id,
        reserva_id,
        cargador_id,
        toma_id,
        estado,
        fecha_hora_inicio,
        fecha_hora_fin_prevista,
        fecha_hora_fin_real,
        potencia_actual_kw,
        energia_consumida_kwh,
        coste_estimado,
        creada_en
      `,
    )
    .eq("reserva_id", reservaId)
    .eq("estado", "activa")
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se ha podido comprobar la carga activa: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  return actualizarEnergiaCargaActiva(convertirCarga(data as CargaBaseDatos));
}

// Busca una carga activa en una toma.
export async function obtenerCargaActivaUsuarioEnToma(
  usuarioId: string,
  cargadorId: string,
  tomaId: string,
): Promise<Carga | null> {
  const { data, error } = await supabase
    .from("cargas")
    .select(
      `
        id,
        usuario_id,
        reserva_id,
        cargador_id,
        toma_id,
        estado,
        fecha_hora_inicio,
        fecha_hora_fin_prevista,
        fecha_hora_fin_real,
        potencia_actual_kw,
        energia_consumida_kwh,
        coste_estimado,
        creada_en
      `,
    )
    .eq("usuario_id", usuarioId)
    .eq("cargador_id", cargadorId)
    .eq("toma_id", tomaId)
    .eq("estado", "activa")
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se ha podido comprobar la carga activa: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  return actualizarEnergiaCargaActiva(convertirCarga(data as CargaBaseDatos));
}

// Inicia una nueva carga.
export async function iniciarCarga(
  datosCarga: DatosNuevaCarga,
): Promise<Carga> {
  if (datosCarga.reservaId) {
    const cargaExistente = await obtenerCargaActivaPorReserva(
      datosCarga.reservaId,
    );

    if (cargaExistente) {
      return cargaExistente;
    }
  }

  // Simula la potencia actual de carga.
  const potenciaActualKw = Number(
    (datosCarga.potenciaMaximaKw * (0.82 + Math.random() * 0.15)).toFixed(1),
  );

  const { data, error } = await supabase
    .from("cargas")
    .insert({
      usuario_id: datosCarga.usuarioId,

      reserva_id: datosCarga.reservaId || null,

      cargador_id: datosCarga.cargadorId,

      toma_id: datosCarga.tomaId,

      estado: "activa",

      fecha_hora_inicio: datosCarga.fechaHoraInicio,

      fecha_hora_fin_prevista: datosCarga.fechaHoraFinPrevista,

      fecha_hora_fin_real: null,

      potencia_actual_kw: potenciaActualKw,

      energia_consumida_kwh: 0,

      coste_estimado: null,
    })
    .select(
      `
        id,
        usuario_id,
        reserva_id,
        cargador_id,
        toma_id,
        estado,
        fecha_hora_inicio,
        fecha_hora_fin_prevista,
        fecha_hora_fin_real,
        potencia_actual_kw,
        energia_consumida_kwh,
        coste_estimado,
        creada_en
      `,
    )
    .single();

  if (error) {
    throw new Error(`No se ha podido iniciar la carga: ${error.message}`);
  }

  return convertirCarga(data as CargaBaseDatos);
}

// Finaliza una carga activa.
export async function finalizarCarga(
  cargaId: string,
  usuarioId: string,
): Promise<Carga> {
  const cargaEncontrada = await obtenerCargaActiva(usuarioId, cargaId);

  if (!cargaEncontrada) {
    throw new Error("No se ha encontrado la carga activa.");
  }

  const fechaHoraFinReal = new Date().toISOString();

  const energiaConsumidaKwh = calcularEnergiaConsumida({
    ...cargaEncontrada,
    fechaHoraFinReal,
  });

  const { data, error } = await supabase
    .from("cargas")
    .update({
      estado: "finalizada",
      fecha_hora_fin_real: fechaHoraFinReal,
      energia_consumida_kwh: energiaConsumidaKwh,
    })
    .eq("id", cargaId)
    .eq("usuario_id", usuarioId)
    .eq("estado", "activa")
    .select(
      `
        id,
        usuario_id,
        reserva_id,
        cargador_id,
        toma_id,
        estado,
        fecha_hora_inicio,
        fecha_hora_fin_prevista,
        fecha_hora_fin_real,
        potencia_actual_kw,
        energia_consumida_kwh,
        coste_estimado,
        creada_en
      `,
    )
    .single();

  if (error) {
    throw new Error(`No se ha podido finalizar la carga: ${error.message}`);
  }

  const cargaFinalizada = convertirCarga(data as CargaBaseDatos);

  // Finaliza también la reserva asociada.
  if (cargaFinalizada.reservaId) {
    const { error: errorReserva } = await supabase
      .from("reservas")
      .update({
        estado: "finalizada",
        actualizada_en: fechaHoraFinReal,
      })
      .eq("id", cargaFinalizada.reservaId)
      .eq("usuario_id", usuarioId)
      .eq("estado", "activa");

    if (errorReserva) {
      console.error(
        "La carga se ha finalizado, pero no se ha podido actualizar la reserva:",
        errorReserva,
      );
    }
  }

  return cargaFinalizada;
}

// Cancela una carga activa.
export async function cancelarCarga(cargaId: string): Promise<Carga> {
  const cargaEncontrada = await obtenerCargaPorId(cargaId);

  if (!cargaEncontrada) {
    throw new Error("No se ha encontrado la carga.");
  }

  if (cargaEncontrada.estado !== "activa") {
    throw new Error("La carga ya no está activa.");
  }

  const fechaHoraFinReal = new Date().toISOString();

  const energiaConsumidaKwh = calcularEnergiaConsumida({
    ...cargaEncontrada,

    fechaHoraFinReal,
  });

  const { data, error } = await supabase
    .from("cargas")
    .update({
      estado: "cancelada",

      fecha_hora_fin_real: fechaHoraFinReal,

      energia_consumida_kwh: energiaConsumidaKwh,
    })
    .eq("id", cargaId)
    .select(
      `
        id,
        usuario_id,
        reserva_id,
        cargador_id,
        toma_id,
        estado,
        fecha_hora_inicio,
        fecha_hora_fin_prevista,
        fecha_hora_fin_real,
        potencia_actual_kw,
        energia_consumida_kwh,
        coste_estimado,
        creada_en
      `,
    )
    .single();

  if (error) {
    throw new Error(`No se ha podido cancelar la carga: ${error.message}`);
  }

  return convertirCarga(data as CargaBaseDatos);
}

// Calcula la energía total de las cargas.
export function calcularEnergiaTotal(cargas: Carga[]) {
  return Number(
    cargas
      .reduce((total, carga) => total + carga.energiaConsumidaKwh, 0)
      .toFixed(2),
  );
}
