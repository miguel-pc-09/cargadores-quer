import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  cerrarSesion as cerrarSesionServicio,
  iniciarSesion as iniciarSesionServicio,
  obtenerSesionActual,
} from "../services/authService";

import type { CredencialesLogin, UsuarioAutenticado } from "../types/auth";

interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  cargandoSesion: boolean;
  autenticado: boolean;
  esAdministrador: boolean;
  iniciarSesion: (
    credenciales: CredencialesLogin,
  ) => Promise<UsuarioAutenticado>;
  cerrarSesion: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);

  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const sesion = obtenerSesionActual();

    setUsuario(sesion?.usuario ?? null);

    setCargandoSesion(false);
  }, []);

  const iniciarSesion = useCallback(async (credenciales: CredencialesLogin) => {
    const resultado = await iniciarSesionServicio(credenciales);

    setUsuario(resultado.usuario);

    return resultado.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    cerrarSesionServicio();
    setUsuario(null);
  }, []);

  const valor = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargandoSesion,
      autenticado: usuario !== null,
      esAdministrador: usuario?.rol === "administrador",
      iniciarSesion,
      cerrarSesion,
    }),
    [usuario, cargandoSesion, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
