import { supabase } from "./supabaseClient";

import {
  obtenerResumenAdministracion,
  type ResumenAdministracion,
} from "./adminService";

export interface ValidacionPendiente {
  solicitudId: string;
  usuarioId: string;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  matricula: string;
}

interface SolicitudRegistroBD {
  id: string;
  usuario_id: string;
  nombre: string;
  apellidos: string;
  dni: string | null;
  email: string;
  matricula: string;
}

const DEMO = "demo-solicitud-";

const DEMO_VALIDACIONES: ValidacionPendiente[] = [
  {
    solicitudId: `${DEMO}1`,

    usuarioId: `${DEMO}usuario-1`,

    nombre: "Laura",

    apellidos: "García Martín",

    dni: "12345678A",

    email: "laura.garcia@demo.cargaquer.es",

    matricula: "1234LGM",
  },

  {
    solicitudId: `${DEMO}2`,

    usuarioId: `${DEMO}usuario-2`,

    nombre: "Javier",

    apellidos: "Sánchez López",

    dni: "23456789B",

    email: "javier.sanchez@demo.cargaquer.es",

    matricula: "5678JSL",
  },
];

function esDemo(solicitudId: string) {
  return solicitudId.startsWith(DEMO);
}

export async function obtenerValidacionesPendientes(): Promise<
  ValidacionPendiente[]
> {
  const { data, error } = await supabase
    .from("solicitudes_registro")
    .select("id,usuario_id,nombre,apellidos,dni,email,matricula")
    .eq("estado", "pendiente")
    .order("creado_en", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `No se han podido cargar las solicitudes pendientes: ${error.message}`,
    );
  }

  const resultado = ((data ?? []) as SolicitudRegistroBD[]).map(
    (solicitud) => ({
      solicitudId: solicitud.id,

      usuarioId: solicitud.usuario_id,

      nombre: solicitud.nombre.trim() || "Sin nombre",

      apellidos: solicitud.apellidos.trim(),

      dni: solicitud.dni?.trim() || "—",

      email: solicitud.email.trim() || "—",

      matricula: solicitud.matricula.trim() || "—",
    }),
  );

  return resultado.length ? resultado : [...DEMO_VALIDACIONES];
}

export async function aceptarValidacion(
  validacion: ValidacionPendiente,
): Promise<void> {
  if (esDemo(validacion.solicitudId)) {
    return;
  }

  const { error } = await supabase.rpc("cargaquer_aprobar_solicitud", {
    p_solicitud_id: validacion.solicitudId,
  });

  if (error) {
    throw new Error(`No se ha podido aprobar la solicitud: ${error.message}`);
  }
}

export async function rechazarValidacion(
  validacion: ValidacionPendiente,
): Promise<void> {
  if (esDemo(validacion.solicitudId)) {
    return;
  }

  const { error } = await supabase.rpc("cargaquer_rechazar_solicitud", {
    p_solicitud_id: validacion.solicitudId,
  });

  if (error) {
    throw new Error(`No se ha podido rechazar la solicitud: ${error.message}`);
  }
}

export async function obtenerResumenAdministracionConSolicitudes(): Promise<ResumenAdministracion> {
  const [resumen, validaciones] = await Promise.all([
    obtenerResumenAdministracion(),

    obtenerValidacionesPendientes(),
  ]);

  return {
    ...resumen,

    validacionesPendientes: validaciones.length,
  };
}
