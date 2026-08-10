export type RolUsuario = "usuario" | "administrador";

export type EstadoCuenta = "pendiente" | "verificada" | "bloqueada";

export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: RolUsuario;
  estadoCuenta: EstadoCuenta;
  ayuntamiento?: string;
}

export interface CredencialesLogin {
  email: string;
  contrasena: string;
}

export interface SesionUsuario {
  usuario: UsuarioAutenticado;
  iniciadaEn: string;
}

export interface ResultadoLogin {
  usuario: UsuarioAutenticado;
}
