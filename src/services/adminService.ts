import { supabase } from "./supabaseClient";

export interface ValidacionPendiente {
  vehiculoId: string;
  usuarioId: string;
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  matricula: string;
  creadoEn: string;
}

interface VehiculoValidacionBD {
  id: string;
  usuario_id: string;
  matricula: string;
  estado_validacion: "pendiente" | "validado" | "rechazado";
  creado_en: string;

  perfiles:
    | {
        id: string;
        nombre: string | null;
        apellidos: string | null;
        dni: string | null;
        telefono: string | null;
        estado_cuenta: "pendiente" | "verificada" | "bloqueada";
      }
    | {
        id: string;
        nombre: string | null;
        apellidos: string | null;
        dni: string | null;
        telefono: string | null;
        estado_cuenta: "pendiente" | "verificada" | "bloqueada";
      }[]
    | null;
}

function obtenerPerfil(perfiles: VehiculoValidacionBD["perfiles"]) {
  if (Array.isArray(perfiles)) {
    return perfiles[0] ?? null;
  }

  return perfiles;
}

export async function obtenerValidacionesPendientes(): Promise<
  ValidacionPendiente[]
> {
  const { data, error } = await supabase
    .from("vehiculos")
    .select(
      `
        id,
        usuario_id,
        matricula,
        estado_validacion,
        creado_en,
        perfiles (
          id,
          nombre,
          apellidos,
          dni,
          telefono,
          estado_cuenta
        )
      `,
    )
    .eq("estado_validacion", "pendiente")
    .order("creado_en", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `No se han podido cargar las validaciones: ${error.message}`,
    );
  }

  return ((data ?? []) as VehiculoValidacionBD[])
    .map((vehiculo) => {
      const perfil = obtenerPerfil(vehiculo.perfiles);

      if (!perfil) {
        return null;
      }

      return {
        vehiculoId: vehiculo.id,
        usuarioId: vehiculo.usuario_id,

        nombre: perfil.nombre?.trim() || "Sin nombre",

        apellidos: perfil.apellidos?.trim() || "",

        dni: perfil.dni?.trim() || "—",

        telefono: perfil.telefono?.trim() || "—",

        matricula: vehiculo.matricula,

        creadoEn: vehiculo.creado_en,
      };
    })
    .filter(
      (validacion): validacion is ValidacionPendiente => validacion !== null,
    );
}

export async function aceptarValidacion(
  validacion: ValidacionPendiente,
): Promise<void> {
  const { error: errorVehiculo } = await supabase
    .from("vehiculos")
    .update({
      estado_validacion: "validado",
      motivo_rechazo: null,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", validacion.vehiculoId)
    .eq("usuario_id", validacion.usuarioId);

  if (errorVehiculo) {
    throw new Error(
      `No se ha podido validar el vehículo: ${errorVehiculo.message}`,
    );
  }

  const { error: errorPerfil } = await supabase
    .from("perfiles")
    .update({
      estado_cuenta: "verificada",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", validacion.usuarioId);

  if (errorPerfil) {
    throw new Error(
      `El vehículo se ha validado, pero no se ha podido activar la cuenta: ${errorPerfil.message}`,
    );
  }
}

export async function rechazarValidacion(
  validacion: ValidacionPendiente,
): Promise<void> {
  const { error: errorVehiculo } = await supabase
    .from("vehiculos")
    .update({
      estado_validacion: "rechazado",
      motivo_rechazo: "Validación rechazada por el Ayuntamiento.",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", validacion.vehiculoId)
    .eq("usuario_id", validacion.usuarioId);

  if (errorVehiculo) {
    throw new Error(
      `No se ha podido rechazar la validación: ${errorVehiculo.message}`,
    );
  }

  const { error: errorPerfil } = await supabase
    .from("perfiles")
    .update({
      estado_cuenta: "bloqueada",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", validacion.usuarioId);

  if (errorPerfil) {
    throw new Error(
      `La matrícula se ha rechazado, pero no se ha podido bloquear la cuenta: ${errorPerfil.message}`,
    );
  }
}
