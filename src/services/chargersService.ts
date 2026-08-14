import { supabase } from "./supabaseClient";

import type {
  Cargador,
  EstadoCargador,
  EstadoToma,
  TomaCargador,
} from "../types/charger";

interface CargadorBaseDatos {
  id: string;
  nombre: string;
  direccion: string;
  activo: boolean;
}

interface TomaBaseDatos {
  id: string;
  cargador_id: string;
  nombre: string;
  potencia_maxima_kw: number | string | null;
  estado: string | null;
  permite_reserva: boolean;
}

function convertirEstadoCargador(activo: boolean): EstadoCargador {
  return activo ? "conectado" : "desconectado";
}

function convertirEstadoToma(estado: string | null): EstadoToma {
  const estadoNormalizado =
    estado?.trim().toLowerCase().replaceAll("_", "-").replaceAll(" ", "-") ??
    "";

  switch (estadoNormalizado) {
    case "libre":
    case "disponible":
      return "libre";

    case "ocupada":
    case "ocupado":
    case "cargando":
    case "en-uso":
      return "ocupada";

    case "reservada":
    case "reservado":
      return "reservada";

    case "fuera-servicio":
    case "fuera-de-servicio":
    case "averiada":
    case "averiado":
    case "inactiva":
    case "inactivo":
      return "fuera-servicio";

    case "mi-carga":
      return "mi-carga";

    default:
      return "fuera-servicio";
  }
}

function convertirToma(toma: TomaBaseDatos): TomaCargador {
  return {
    id: toma.id,

    nombre: toma.nombre?.trim() || "Toma",

    estado: convertirEstadoToma(toma.estado),

    potenciaMaximaKw: Number(toma.potencia_maxima_kw) || 0,

    permiteReserva: Boolean(toma.permite_reserva),
  };
}

export async function obtenerCargadores(): Promise<Cargador[]> {
  const [resultadoCargadores, resultadoTomas] = await Promise.all([
    supabase
      .from("cargadores")
      .select(
        `
          id,
          nombre,
          direccion,
          activo
        `,
      )
      .order("nombre", {
        ascending: true,
      }),

    supabase
      .from("tomas")
      .select(
        `
          id,
          cargador_id,
          nombre,
          potencia_maxima_kw,
          estado,
          permite_reserva
        `,
      )
      .order("nombre", {
        ascending: true,
      }),
  ]);

  if (resultadoCargadores.error) {
    throw new Error(
      `No se han podido cargar los cargadores: ${resultadoCargadores.error.message}`,
    );
  }

  if (resultadoTomas.error) {
    throw new Error(
      `No se han podido cargar las tomas: ${resultadoTomas.error.message}`,
    );
  }

  const cargadores = (resultadoCargadores.data ?? []) as CargadorBaseDatos[];

  const tomas = (resultadoTomas.data ?? []) as TomaBaseDatos[];

  return cargadores.map((cargador): Cargador => {
    const tomasCargador = tomas
      .filter((toma) => toma.cargador_id === cargador.id)
      .map(convertirToma);

    return {
      id: cargador.id,

      nombre: cargador.nombre?.trim() || "Cargador",

      direccion: cargador.direccion?.trim() || "Quer",

      estado: convertirEstadoCargador(cargador.activo),

      permiteReserva: tomasCargador.some((toma) => toma.permiteReserva),

      tomas: tomasCargador,
    };
  });
}

export async function obtenerCargadorPorId(
  cargadorId: string,
): Promise<Cargador | null> {
  const cargadores = await obtenerCargadores();

  return cargadores.find((cargador) => cargador.id === cargadorId) ?? null;
}

export async function obtenerTomaPorId(
  cargadorId: string,
  tomaId: string,
): Promise<TomaCargador | null> {
  const cargador = await obtenerCargadorPorId(cargadorId);

  if (!cargador) {
    return null;
  }

  return cargador.tomas.find((toma) => toma.id === tomaId) ?? null;
}
