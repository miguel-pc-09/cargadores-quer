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
  obtenerUsuarioPorSesion,
} from "../services/authService";

import { supabase } from "../services/supabaseClient";

import type { CredencialesLogin, UsuarioAutenticado } from "../types/auth";

interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  cargandoSesion: boolean;
  autenticado: boolean;
  esAdministrador: boolean;

  iniciarSesion: (
    credenciales: CredencialesLogin,
  ) => Promise<UsuarioAutenticado>;

  cerrarSesion: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);

  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargarSesionInicial = async () => {
      try {
        const sesion = await obtenerSesionActual();

        if (!activo) {
          return;
        }

        setUsuario(sesion?.usuario ?? null);
      } catch {
        if (activo) {
          setUsuario(null);
        }
      } finally {
        if (activo) {
          setCargandoSesion(false);
        }
      }
    };

    void cargarSesionInicial();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!activo) {
        return;
      }

      if (!sesion?.user) {
        setUsuario(null);
        setCargandoSesion(false);

        return;
      }

      window.setTimeout(() => {
        void (async () => {
          try {
            const usuarioSesion = await obtenerUsuarioPorSesion(sesion.user);

            if (activo) {
              setUsuario(usuarioSesion);
            }
          } catch {
            if (activo) {
              setUsuario(null);
            }
          } finally {
            if (activo) {
              setCargandoSesion(false);
            }
          }
        })();
      }, 0);
    });

    return () => {
      activo = false;

      subscription.unsubscribe();
    };
  }, []);

  const iniciarSesion = useCallback(async (credenciales: CredencialesLogin) => {
    const resultado = await iniciarSesionServicio(credenciales);

    setUsuario(resultado.usuario);

    return resultado.usuario;
  }, []);

  const cerrarSesion = useCallback(async () => {
    await cerrarSesionServicio();

    setUsuario(null);
  }, []);

  const value = useMemo<AuthContextValue>(
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
