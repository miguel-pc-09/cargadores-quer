export type RolUsuario = "usuario" | "administrador";

export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: RolUsuario;
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
