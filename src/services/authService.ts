import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabaseClient";

import type {
  CredencialesLogin,
  ResultadoLogin,
  SesionUsuario,
  UsuarioAutenticado,
} from "../types/auth";

interface PerfilSupabase {
  id: string;
  nombre: string | null;
  apellidos: string | null;
  telefono: string | null;
  rol: "usuario" | "administrador";
  cliente: string | null;
  estado_cuenta: "pendiente" | "verificada" | "bloqueada";
}

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
    ayuntamiento: perfil.cliente ?? undefined,
  };
}

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
    .single();

  if (error) {
    throw new Error(
      `No se ha podido cargar el perfil del usuario: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error("No existe el perfil asociado al usuario.");
  }

  return convertirPerfilEnUsuario(data as PerfilSupabase, email);
}

export async function obtenerUsuarioPorSesion(
  usuarioAuth: User,
): Promise<UsuarioAutenticado> {
  return obtenerPerfilUsuario(usuarioAuth.id, usuarioAuth.email ?? "");
}

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

  const usuario = await obtenerUsuarioPorSesion(data.user);

  return {
    usuario,
  };
}

export async function cerrarSesion(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("No se ha podido cerrar la sesión.");
  }
}

export async function obtenerSesionActual(): Promise<SesionUsuario | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  const sesion = data.session;

  if (!sesion?.user) {
    return null;
  }

  const usuario = await obtenerUsuarioPorSesion(sesion.user);

  return {
    usuario,
    iniciadaEn: sesion.user.last_sign_in_at ?? new Date().toISOString(),
  };
}
