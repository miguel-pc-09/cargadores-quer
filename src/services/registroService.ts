import { supabase } from "./supabaseClient";

import type { Cliente } from "../types/cliente";
import type { DatosFormularioRegistro } from "../types/registro";

// Datos necesarios para enviar un registro.
export interface SolicitudRegistro {
  cliente: Cliente;
  formulario: DatosFormularioRegistro;
}

// Función para normalizar la matrícula.
function normalizarMatricula(matricula: string) {
  return matricula.trim().toUpperCase().replace(/[\s-]/g, "");
}

// Función para normalizar el documento.
function normalizarDocumento(documento: string) {
  return documento.trim().toUpperCase().replace(/[\s-]/g, "");
}

// Función para proteger el documento con SHA-256.
async function crearHashDocumento(documento: string) {
  const contenido = new TextEncoder().encode(normalizarDocumento(documento));

  const resumen = await crypto.subtle.digest("SHA-256", contenido);

  return Array.from(new Uint8Array(resumen))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Función para mostrar errores de registro más claros.
function obtenerMensajeError(mensaje: string) {
  const mensajeMinusculas = mensaje.toLowerCase();

  if (mensajeMinusculas.includes("user already registered")) {
    return "Ya existe una cuenta registrada con este correo electrónico.";
  }

  if (
    mensajeMinusculas.includes("duplicate key") ||
    mensajeMinusculas.includes("solicitudes_registro")
  ) {
    return "Ya existe una cuenta asociada a estos datos.";
  }

  return "No se ha podido completar el registro.";
}

// Función para registrar un nuevo usuario.
export async function enviarSolicitudRegistro(
  solicitud: SolicitudRegistro,
): Promise<void> {
  const { cliente, formulario } = solicitud;

  const usuario = formulario.usuarioPrincipal;

  const email = usuario.email.trim().toLowerCase();

  const matricula = normalizarMatricula(formulario.matricula);

  const dniProtegido = await crearHashDocumento(usuario.dni);

  // Crea el usuario con acceso directo.
  const { data, error } = await supabase.auth.signUp({
    email,

    password: usuario.contrasena,

    options: {
      data: {
        nombre: usuario.nombre.trim(),
        apellidos: usuario.apellidos.trim(),
        telefono: usuario.telefono.trim(),
        dni: dniProtegido,
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
    throw new Error("No se ha podido crear la cuenta.");
  }
}
