import type {
  CredencialesLogin,
  ResultadoLogin,
  SesionUsuario,
  UsuarioAutenticado,
} from "../types/auth";

const CLAVE_SESION = "cargaquer_sesion";

const USUARIO_DEMO: UsuarioAutenticado = {
  id: "usuario-demo",
  nombre: "Miguel",
  apellidos: "Ángel",
  email: "usuario@cargaquer.es",
  rol: "usuario",
};

const ADMIN_DEMO: UsuarioAutenticado = {
  id: "admin-ayuntamiento-quer",
  nombre: "Ayuntamiento",
  apellidos: "de Quer",
  email: "admin@cargaquer.es",
  rol: "administrador",
  ayuntamiento: "Ayuntamiento de Quer",
};

const CONTRASENA_DEMO = "12345678";

function guardarSesion(usuario: UsuarioAutenticado): void {
  const sesion: SesionUsuario = {
    usuario,
    iniciadaEn: new Date().toISOString(),
  };

  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export async function iniciarSesion(
  credenciales: CredencialesLogin,
): Promise<ResultadoLogin> {
  const email = credenciales.email.trim().toLowerCase();

  const contrasena = credenciales.contrasena.trim();

  /*
   * Simulamos una pequeña espera para que el comportamiento
   * sea parecido al que tendremos cuando conectemos Supabase.
   */
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 500);
  });

  if (
    email === USUARIO_DEMO.email.toLowerCase() &&
    contrasena === CONTRASENA_DEMO
  ) {
    guardarSesion(USUARIO_DEMO);

    return {
      usuario: USUARIO_DEMO,
    };
  }

  if (
    email === ADMIN_DEMO.email.toLowerCase() &&
    contrasena === CONTRASENA_DEMO
  ) {
    guardarSesion(ADMIN_DEMO);

    return {
      usuario: ADMIN_DEMO,
    };
  }

  throw new Error("El correo electrónico o la contraseña no son correctos.");
}

export function obtenerSesionActual(): SesionUsuario | null {
  try {
    const sesionGuardada = localStorage.getItem(CLAVE_SESION);

    if (!sesionGuardada) {
      return null;
    }

    const sesion = JSON.parse(sesionGuardada) as SesionUsuario;

    if (
      !sesion.usuario ||
      !sesion.usuario.id ||
      !sesion.usuario.email ||
      !sesion.usuario.rol
    ) {
      cerrarSesion();

      return null;
    }

    return sesion;
  } catch {
    cerrarSesion();

    return null;
  }
}

export function obtenerUsuarioActual(): UsuarioAutenticado | null {
  return obtenerSesionActual()?.usuario ?? null;
}

export function haySesionActiva(): boolean {
  return obtenerSesionActual() !== null;
}

export function usuarioEsAdministrador(): boolean {
  return obtenerUsuarioActual()?.rol === "administrador";
}

export function usuarioEsUsuarioNormal(): boolean {
  return obtenerUsuarioActual()?.rol === "usuario";
}

export function cerrarSesion(): void {
  localStorage.removeItem(CLAVE_SESION);
}
