import { createContext } from "react";

import type { CredencialesLogin, UsuarioAutenticado } from "../types/auth";

// Datos disponibles desde el contexto de autenticación.
export interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  cargandoSesion: boolean;
  autenticado: boolean;
  esAdministrador: boolean;

  iniciarSesion: (
    credenciales: CredencialesLogin,
  ) => Promise<UsuarioAutenticado>;

  cerrarSesion: () => Promise<void>;
}

// Contexto general de autenticación.
export const AuthContext = createContext<AuthContextValue | null>(null);
