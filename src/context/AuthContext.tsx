import {
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

import { AuthContext, type AuthContextValue } from "./AuthContextBase";

// Propiedades del proveedor de autenticación.
interface AuthProviderProps {
  children: ReactNode;
}

// Proveedor encargado de mantener la sesión.
function AuthProvider({ children }: AuthProviderProps) {
  // Usuario que tiene la sesión iniciada.
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);

  // Estado de comprobación de la sesión.
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Carga inicial y cambios de sesión.
  useEffect(() => {
    let activo = true;

    // Función para recuperar la sesión inicial.
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

    // Escucha los cambios de sesión de Supabase.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!activo) {
        return;
      }

      // Limpia el usuario cuando se cierra la sesión.
      if (!sesion?.user) {
        setUsuario(null);

        setCargandoSesion(false);

        return;
      }

      // Recupera los datos del usuario de la sesión.
      window.setTimeout(() => {
        void (async () => {
          try {
            const usuarioSesion = await obtenerUsuarioPorSesion(sesion.user);

            if (activo) {
              setUsuario(usuarioSesion);
            }
          } catch {
            /*
             Durante el registro puede existir una sesión temporal.
             Si el usuario aún no está aprobado, no se inicia sesión.
             */
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

    // Cancela la escucha al desmontar el proveedor.
    return () => {
      activo = false;

      subscription.unsubscribe();
    };
  }, []);

  // Función para iniciar sesión.
  const iniciarSesion = useCallback(async (credenciales: CredencialesLogin) => {
    const resultado = await iniciarSesionServicio(credenciales);

    setUsuario(resultado.usuario);

    return resultado.usuario;
  }, []);

  // Función para cerrar sesión.
  const cerrarSesion = useCallback(async () => {
    await cerrarSesionServicio();

    setUsuario(null);
  }, []);

  // Valores disponibles para el resto de la aplicación.
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
