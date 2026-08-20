import { supabase } from "./supabaseClient";

import type { DatosVehiculo, EstadoValidacionVehiculo } from "../types/user";

// Estructura del vehículo en la base de datos.
interface VehiculoBaseDatos {
  id: string;
  usuario_id: string;
  matricula: string;
  estado_validacion: string;
}

// Comprueba si el estado de validación es válido.
function esEstadoValidacionVehiculo(
  estado: string,
): estado is EstadoValidacionVehiculo {
  return (
    estado === "validado" || estado === "pendiente" || estado === "rechazado"
  );
}

// Convierte un vehículo de Supabase.
function convertirVehiculo(vehiculo: VehiculoBaseDatos): DatosVehiculo {
  return {
    id: vehiculo.id,

    usuarioId: vehiculo.usuario_id,

    matricula: vehiculo.matricula,

    estadoValidacion: esEstadoValidacionVehiculo(vehiculo.estado_validacion)
      ? vehiculo.estado_validacion
      : "pendiente",
  };
}

// Obtiene el vehículo de un usuario.
export async function obtenerVehiculoUsuario(
  usuarioId: string,
): Promise<DatosVehiculo | null> {
  const { data, error } = await supabase
    .from("vehiculos")
    .select("id, usuario_id, matricula, estado_validacion")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido obtener el vehículo: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return convertirVehiculo(data as VehiculoBaseDatos);
}

// Actualiza la matrícula del vehículo.
export async function actualizarMatriculaVehiculo(
  usuarioId: string,
  matricula: string,
): Promise<DatosVehiculo> {
  const matriculaNormalizada = matricula
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, "");

  const { data, error } = await supabase
    .from("vehiculos")
    .update({
      matricula: matriculaNormalizada,

      estado_validacion: "pendiente",
    })
    .eq("usuario_id", usuarioId)
    .select("id, usuario_id, matricula, estado_validacion")
    .single();

  if (error) {
    throw new Error(
      `No se ha podido actualizar la matrícula: ${error.message}`,
    );
  }

  return convertirVehiculo(data as VehiculoBaseDatos);
}

// Comprueba si el vehículo está validado.
export async function vehiculoEstaValidado(
  usuarioId: string,
): Promise<boolean> {
  const vehiculo = await obtenerVehiculoUsuario(usuarioId);

  return vehiculo?.estadoValidacion === "validado";
}

// Comprueba si el usuario puede reservar.
export async function puedeUsuarioReservar(
  usuarioId: string,
): Promise<boolean> {
  return vehiculoEstaValidado(usuarioId);
}

// Comprueba si el usuario puede iniciar una carga.
export async function puedeUsuarioIniciarCarga(
  usuarioId: string,
): Promise<boolean> {
  return vehiculoEstaValidado(usuarioId);
}
