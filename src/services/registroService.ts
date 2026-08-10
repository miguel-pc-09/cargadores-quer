import { supabase } from "./supabaseClient";

import type { Cliente } from "../types/cliente";
import type { DatosFormularioRegistro } from "../types/registro";

export interface SolicitudRegistro {
  cliente: Cliente;
  formulario: DatosFormularioRegistro;
}

function normalizarMatricula(matricula: string) {
  return matricula.trim().toUpperCase().replace(/[\s-]/g, "");
}

function obtenerMensajeError(mensaje: string) {
  const mensajeMinusculas = mensaje.toLowerCase();

  if (mensajeMinusculas.includes("user already registered")) {
    return "Ya existe una cuenta registrada con este correo electrónico.";
  }

  return "No se ha podido completar el registro.";
}

export async function enviarSolicitudRegistro(
  solicitud: SolicitudRegistro,
): Promise<void> {
  const { cliente, formulario } = solicitud;

  const usuario = formulario.usuarioPrincipal;

  const email = usuario.email.trim().toLowerCase();

  const matricula = normalizarMatricula(formulario.matricula);

  const { data, error } = await supabase.auth.signUp({
    email,

    password: usuario.contrasena,

    options: {
      data: {
        nombre: usuario.nombre.trim(),

        apellidos: usuario.apellidos.trim(),

        telefono: usuario.telefono.trim(),

        dni: usuario.dni.trim().toUpperCase(),

        cliente: cliente.nombre,

        tipo_usuario: formulario.tipoUsuario,

        filiacion: usuario.filiacion,

        matricula,
      },
    },
  });

  if (error) {
    throw new Error(obtenerMensajeError(error.message));
  }

  if (!data.user) {
    throw new Error("No se ha podido crear el usuario.");
  }
}
