export type TipoUsuario = "" | "particular" | "empresa" | "servicio-publico";

export type Filiacion = "" | "residente" | "trabajador" | "actividad";

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

export type ErroresRegistro = Record<string, string>;
