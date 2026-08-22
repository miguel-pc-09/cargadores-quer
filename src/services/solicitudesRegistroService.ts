import { supabase } from "./supabaseClient";

import {
  obtenerResumenAdministracion,
  type ResumenAdministracion,
} from "./adminService";

// Datos de una solicitud pendiente.
export interface ValidacionPendiente {
  solicitudId: string;
  usuarioId: string;
  nombre: string;
  apellidos: string;
  dniProtegido: string;
  email: string;
  matricula: string;
}

// Solicitud de registro en la base de datos.
interface SolicitudRegistroBD {
  id: string;
  usuario_id: string;
  nombre: string;
  apellidos: string;
  dni: string | null;
  email: string;
  matricula: string;
}

// Prefijo para solicitudes de demostración.
const DEMO = "demo-solicitud-";

// Solicitudes pendientes de demostración.
const DEMO_VALIDACIONES: ValidacionPendiente[] = [
  {
    solicitudId: `${DEMO}1`,

    usuarioId: `${DEMO}usuario-1`,

    nombre: "Laura",

    apellidos: "García Martín",

    dniProtegido: "8F3A21…C91D",

    email: "laura.garcia@demo.cargaquer.es",

    matricula: "1234LGM",
  },

  {
    solicitudId: `${DEMO}2`,

    usuarioId: `${DEMO}usuario-2`,

    nombre: "Javier",

    apellidos: "Sánchez López",

    dniProtegido: "4B72D8…A305",

    email: "javier.sanchez@demo.cargaquer.es",

    matricula: "5678JSL",
  },
];

// Comprueba si la solicitud es de demostración.
function esDemo(solicitudId: string) {
  return solicitudId.startsWith(DEMO);
}

// Formatea el DNI protegido.
function formatearDocumentoProtegido(valor: string | null) {
  const hash = valor?.trim() ?? "";

  if (!hash) {
    return "—";
  }

  if (hash.length <= 12) {
    return hash;
  }

  return `${hash.slice(0, 6).toUpperCase()}…${hash.slice(-4).toUpperCase()}`;
}

// Obtiene las solicitudes pendientes.
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

  // Prepara los datos de cada solicitud.
  const resultado = ((data ?? []) as SolicitudRegistroBD[]).map(
    (solicitud) => ({
      solicitudId: solicitud.id,

      usuarioId: solicitud.usuario_id,

      nombre: solicitud.nombre.trim() || "Sin nombre",

      apellidos: solicitud.apellidos.trim(),

      dniProtegido: formatearDocumentoProtegido(solicitud.dni),

      email: solicitud.email.trim() || "—",

      matricula: solicitud.matricula.trim() || "—",
    }),
  );

  return resultado.length ? resultado : [...DEMO_VALIDACIONES];
}

// Aprueba una solicitud pendiente.
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

  const { error: errorAviso } = await supabase.functions.invoke(
    "procesar-avisos",
    {
      body: {
        origen: "aprobacion",
      },
    },
  );

  if (errorAviso) {
    console.error(
      "La solicitud se ha aprobado, pero no se ha podido enviar el correo de aprobación de forma inmediata:",
      errorAviso,
    );
  }
}

// Rechaza una solicitud pendiente.
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

// Obtiene el resumen con solicitudes pendientes.
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
