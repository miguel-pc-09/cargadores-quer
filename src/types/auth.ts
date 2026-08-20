// Roles disponibles para los usuarios.
export type RolUsuario = "usuario" | "administrador";

// Estados posibles de una cuenta.
export type EstadoCuenta = "pendiente" | "verificada" | "bloqueada";

// Datos del usuario autenticado.
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

// Datos necesarios para iniciar sesión.
export interface CredencialesLogin {
  email: string;
  contrasena: string;
}

// Datos de una sesión de usuario.
export interface SesionUsuario {
  usuario: UsuarioAutenticado;
  iniciadaEn: string;
}

// Resultado de un inicio de sesión correcto.
export interface ResultadoLogin {
  usuario: UsuarioAutenticado;
}
