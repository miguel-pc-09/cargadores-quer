// Tipos de usuario disponibles en el registro.
export type TipoUsuario = "" | "particular" | "empresa" | "servicio-publico";

// Relación del usuario con el Ayuntamiento.
export type Filiacion = "" | "residente" | "trabajador" | "actividad";

// Datos de cada usuario del formulario.
export interface DatosUsuarioRegistro {
  nombre: string;
  apellidos: string;
  email: string;
  contrasena: string;
  repetirContrasena: string;
  dni: string;
  telefono: string;
  filiacion: Filiacion;
}

// Datos completos de la solicitud de registro.
export interface DatosFormularioRegistro {
  clienteId: string;
  matricula: string;
  tipoUsuario: TipoUsuario;
  usuarioPrincipal: DatosUsuarioRegistro;
  tieneSegundoConductor: boolean;
  segundoConductor: DatosUsuarioRegistro;
  haLeidoAviso: boolean;
  aceptaCondiciones: boolean;
}

// Errores asociados a cada campo del formulario.
export type ErroresRegistro = Record<string, string>;
