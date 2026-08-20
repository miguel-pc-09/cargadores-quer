import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabaseClient";

import type {
  CredencialesLogin,
  EstadoCuenta,
  ResultadoLogin,
  RolUsuario,
  SesionUsuario,
  UsuarioAutenticado,
} from "../types/auth";

// Datos del perfil guardado en Supabase.
interface PerfilSupabase {
  id: string;
  nombre: string | null;
  apellidos: string | null;
  telefono: string | null;
  rol: RolUsuario;
  cliente: string | null;
  estado_cuenta: EstadoCuenta;
}

// Datos necesarios para comprobar una solicitud.
interface SolicitudAccesoBD {
  estado: "pendiente" | "aprobada" | "rechazada";
  motivo_rechazo: string | null;
}

// Convierte el perfil de Supabase al usuario de la aplicación.
function convertirPerfilEnUsuario(
  perfil: PerfilSupabase,
  email: string,
): UsuarioAutenticado {
  return {
    id: perfil.id,

    nombre: perfil.nombre ?? "",

    apellidos: perfil.apellidos ?? "",

    email,

    telefono: perfil.telefono ?? undefined,

    rol: perfil.rol,

    estadoCuenta: perfil.estado_cuenta,

    ayuntamiento: perfil.cliente ?? undefined,
  };
}

// Comprueba una solicitud cuando todavía no existe perfil.
async function comprobarSolicitudSinPerfil(usuarioId: string) {
  const { data, error } = await supabase
    .from("solicitudes_registro")
    .select("estado,motivo_rechazo")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se ha podido comprobar el estado de tu solicitud: ${error.message}`,
    );
  }

  const solicitud = data as SolicitudAccesoBD | null;

  if (!solicitud) {
    throw new Error(
      "No existe una solicitud de acceso asociada a esta cuenta.",
    );
  }

  if (solicitud.estado === "pendiente") {
    throw new Error(
      "Tu solicitud todavía está pendiente de aprobación por el Ayuntamiento.",
    );
  }

  if (solicitud.estado === "rechazada") {
    throw new Error(
      solicitud.motivo_rechazo?.trim() ||
        "Tu solicitud de acceso ha sido rechazada por el Ayuntamiento.",
    );
  }

  throw new Error(
    "Tu solicitud figura como aprobada, pero el perfil todavía no está disponible.",
  );
}

// Recupera el perfil completo del usuario.
async function obtenerPerfilUsuario(
  usuarioId: string,
  email: string,
): Promise<UsuarioAutenticado> {
  const { data, error } = await supabase
    .from("perfiles")
    .select(
      `
        id,
        nombre,
        apellidos,
        telefono,
        rol,
        cliente,
        estado_cuenta
      `,
    )
    .eq("id", usuarioId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se ha podido cargar el perfil del usuario: ${error.message}`,
    );
  }

  if (!data) {
    await comprobarSolicitudSinPerfil(usuarioId);

    throw new Error("No existe el perfil asociado al usuario.");
  }

  return convertirPerfilEnUsuario(data as PerfilSupabase, email);
}

// Comprueba si la cuenta puede acceder al servicio.
function comprobarAcceso(usuario: UsuarioAutenticado) {
  if (usuario.rol === "administrador") {
    return;
  }

  if (usuario.estadoCuenta === "pendiente") {
    throw new Error(
      "Tu solicitud todavía está pendiente de aprobación por el Ayuntamiento.",
    );
  }

  if (usuario.estadoCuenta === "bloqueada") {
    throw new Error(
      "Tu cuenta está bloqueada. Ponte en contacto con el Ayuntamiento.",
    );
  }

  if (usuario.estadoCuenta !== "verificada") {
    throw new Error("Tu cuenta todavía no tiene acceso al servicio.");
  }
}

// Obtiene el usuario a partir de una sesión de Supabase.
export async function obtenerUsuarioPorSesion(
  usuarioAuth: User,
): Promise<UsuarioAutenticado> {
  const usuario = await obtenerPerfilUsuario(
    usuarioAuth.id,
    usuarioAuth.email ?? "",
  );

  comprobarAcceso(usuario);

  return usuario;
}

// Inicia sesión con correo y contraseña.
export async function iniciarSesion(
  credenciales: CredencialesLogin,
): Promise<ResultadoLogin> {
  const email = credenciales.email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,

    password: credenciales.contrasena,
  });

  if (error) {
    throw new Error("Correo electrónico o contraseña incorrectos.");
  }

  if (!data.user) {
    throw new Error("No se ha podido recuperar el usuario autenticado.");
  }

  try {
    const usuario = await obtenerUsuarioPorSesion(data.user);

    return {
      usuario,
    };
  } catch (error) {
    // Cierra la sesión si la cuenta no tiene acceso.
    await supabase.auth.signOut();

    throw error;
  }
}

// Cierra la sesión actual.
export async function cerrarSesion(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("No se ha podido cerrar la sesión.");
  }
}

// Recupera la sesión guardada al abrir la aplicación.
export async function obtenerSesionActual(): Promise<SesionUsuario | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  const sesion = data.session;

  if (!sesion?.user) {
    return null;
  }

  try {
    const usuario = await obtenerUsuarioPorSesion(sesion.user);

    return {
      usuario,

      iniciadaEn: sesion.user.last_sign_in_at ?? new Date().toISOString(),
    };
  } catch {
    // Elimina sesiones que ya no tengan acceso válido.
    await supabase.auth.signOut();

    return null;
  }
}
