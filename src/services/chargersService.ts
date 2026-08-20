import { supabase } from "./supabaseClient";

import { cargadoresSimulados } from "../data/cargadores";

import type {
  Cargador,
  EstadoCargador,
  EstadoToma,
  TomaCargador,
} from "../types/charger";

// Datos del cargador en Supabase.
interface CargadorBaseDatos {
  id: string;
  nombre: string;
  direccion: string;
  activo: boolean;
}

// Datos de la toma en Supabase.
interface TomaBaseDatos {
  id: string;
  cargador_id: string;
  nombre: string;
  potencia_maxima_kw: number | string | null;
  estado: string | null;
  permite_reserva: boolean;
}

// Convierte el estado del cargador.
function convertirEstadoCargador(activo: boolean): EstadoCargador {
  return activo ? "conectado" : "desconectado";
}

// Convierte el estado de una toma.
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

// Convierte una toma de Supabase.
function convertirToma(toma: TomaBaseDatos): TomaCargador {
  return {
    id: toma.id,

    nombre: toma.nombre?.trim() || "Toma",

    estado: convertirEstadoToma(toma.estado),

    potenciaMaximaKw: Number(toma.potencia_maxima_kw) || 0,

    permiteReserva: Boolean(toma.permite_reserva),
  };
}

// Normaliza textos para compararlos.
function normalizarTexto(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Busca el cargador de demostración.
function buscarCargadorSimulado(nombre: string) {
  const nombreNormalizado = normalizarTexto(nombre);

  return cargadoresSimulados.find(
    (cargador) => normalizarTexto(cargador.nombre) === nombreNormalizado,
  );
}

// Añade los estados de demostración.
function aplicarDemostracion(
  cargadorReal: Cargador,
  cargadorSimulado: Cargador | undefined,
): Cargador {
  if (!cargadorSimulado) {
    return cargadorReal;
  }

  const tomas = cargadorReal.tomas.map((tomaReal, indice) => {
    const tomaSimulada =
      cargadorSimulado.tomas.find(
        (toma) =>
          normalizarTexto(toma.nombre) === normalizarTexto(tomaReal.nombre),
      ) ?? cargadorSimulado.tomas[indice];

    if (!tomaSimulada) {
      return tomaReal;
    }

    // Mantiene el ID real y aplica el estado simulado.
    return {
      ...tomaReal,

      estado: tomaSimulada.estado,

      disponibleDesde: tomaSimulada.disponibleDesde,

      usuarioActual: tomaSimulada.usuarioActual,
    };
  });

  return {
    ...cargadorReal,

    ubicacion: cargadorSimulado.ubicacion,

    fabricante: cargadorSimulado.fabricante,

    gestor: cargadorSimulado.gestor,

    tomas,
  };
}

// Crea una copia de los datos simulados.
function crearCargadoresDesdeDatosSimulados(): Cargador[] {
  return cargadoresSimulados.map((cargador) => ({
    ...cargador,

    tomas: cargador.tomas.map((toma) => ({
      ...toma,
    })),
  }));
}

// Obtiene todos los cargadores.
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

  // Usa la demostración si falla la carga de cargadores.
  if (resultadoCargadores.error) {
    if (cargadoresSimulados.length > 0) {
      return crearCargadoresDesdeDatosSimulados();
    }

    throw new Error(
      `No se han podido cargar los cargadores: ${resultadoCargadores.error.message}`,
    );
  }

  // Usa la demostración si falla la carga de tomas.
  if (resultadoTomas.error) {
    if (cargadoresSimulados.length > 0) {
      return crearCargadoresDesdeDatosSimulados();
    }

    throw new Error(
      `No se han podido cargar las tomas: ${resultadoTomas.error.message}`,
    );
  }

  const cargadores = (resultadoCargadores.data ?? []) as CargadorBaseDatos[];

  const tomas = (resultadoTomas.data ?? []) as TomaBaseDatos[];

  // Usa la demostración si no existen cargadores.
  if (cargadores.length === 0) {
    return crearCargadoresDesdeDatosSimulados();
  }

  // Convierte los cargadores recibidos de Supabase.
  const cargadoresReales = cargadores.map((cargador): Cargador => {
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

  // Combina los datos reales con la demostración.
  return cargadoresReales.map((cargador) =>
    aplicarDemostracion(cargador, buscarCargadorSimulado(cargador.nombre)),
  );
}

// Obtiene un cargador por su ID.
export async function obtenerCargadorPorId(
  cargadorId: string,
): Promise<Cargador | null> {
  const cargadores = await obtenerCargadores();

  return cargadores.find((cargador) => cargador.id === cargadorId) ?? null;
}

// Obtiene una toma por su ID.
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
