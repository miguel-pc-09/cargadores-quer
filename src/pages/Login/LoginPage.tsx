import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../styles/Login/LoginPage.css";

type TipoAviso = "error" | "usuario-no-existe" | null;

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [recordarme, setRecordarme] = useState(false);

  const [mensajeAviso, setMensajeAviso] = useState("");
  const [tipoAviso, setTipoAviso] = useState<TipoAviso>(null);
  const [enviando, setEnviando] = useState(false);

  async function iniciarSesion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    limpiarAviso();

    const emailLimpio = email.trim();
    const contrasenaLimpia = contrasena.trim();

    if (!emailLimpio && !contrasenaLimpia) {
      mostrarError("Debes introducir el correo electrónico y la contraseña.");
      return;
    }

    if (!emailLimpio) {
      mostrarError("Debes introducir el correo electrónico.");
      return;
    }

    if (!validarEmail(emailLimpio)) {
      mostrarError("El correo electrónico no tiene un formato válido.");
      return;
    }

    if (!contrasenaLimpia) {
      mostrarError("Debes introducir la contraseña.");
      return;
    }

    if (contrasenaLimpia.length < 8) {
      mostrarError("La contraseña debe contener al menos 8 caracteres.");
      return;
    }

    try {
      setEnviando(true);

      /*
       * Simulación temporal.
       *
       * Cuando conectemos Supabase, aquí se comprobarán
       * realmente el correo y la contraseña.
       */
      await new Promise((resolve) => {
        window.setTimeout(resolve, 700);
      });

      /* setTipoAviso("usuario-no-existe");
      setMensajeAviso(
        "No existe ningún usuario registrado con esos datos. Puedes solicitar el alta en el servicio.",
      ); */

      navigate("/panel");
    } catch (errorInicioSesion) {
      console.error("Error al iniciar sesión:", errorInicioSesion);

      mostrarError("No se ha podido iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function mostrarError(mensaje: string) {
    setTipoAviso("error");
    setMensajeAviso(mensaje);
  }

  function limpiarAviso() {
    setTipoAviso(null);
    setMensajeAviso("");
  }

  function cambiarEmail(valor: string) {
    setEmail(valor);

    if (tipoAviso) {
      limpiarAviso();
    }
  }

  function cambiarContrasena(valor: string) {
    setContrasena(valor);

    if (tipoAviso) {
      limpiarAviso();
    }
  }

  return (
    <main className="login">
      <section className="login__contenido">
        <header className="login__cabecera">
          <div className="login__marca">
            <span className="login__icono" aria-hidden="true">
              ⚡
            </span>

            <div>
              <span className="login__ayuntamiento">Ayuntamiento de Quer</span>

              <strong className="login__nombre">CargaQuer</strong>
            </div>
          </div>

          <p className="login__descripcion">
            Gestión de cargadores eléctricos municipales
          </p>
        </header>

        <section className="login__tarjeta">
          <div className="login__titulo">
            <span>Acceso de usuarios</span>

            <h1>Iniciar sesión</h1>

            <p>
              Accede para consultar los cargadores, tus reservas y el historial
              de cargas.
            </p>
          </div>

          <form
            className="login__formulario"
            noValidate
            onSubmit={iniciarSesion}
          >
            {tipoAviso && (
              <div
                className={`login__aviso login__aviso--${tipoAviso}`}
                role="alert"
              >
                <div className="login__aviso-contenido">
                  <strong>
                    {tipoAviso === "usuario-no-existe"
                      ? "Usuario no encontrado"
                      : "Revisa los datos"}
                  </strong>

                  <p>{mensajeAviso}</p>
                </div>

                {tipoAviso === "usuario-no-existe" && (
                  <button
                    type="button"
                    className="login__aviso-boton"
                    onClick={() => navigate("/registro")}
                  >
                    Solicitar registro
                  </button>
                )}
              </div>
            )}

            <div className="login__campo">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                placeholder="usuario@email.com"
                autoComplete="email"
                inputMode="email"
                aria-invalid={tipoAviso === "error" ? "true" : "false"}
                onChange={(evento) => cambiarEmail(evento.target.value)}
              />
            </div>

            <div className="login__campo">
              <label htmlFor="contrasena">Contraseña</label>

              <div className="login__contrasena">
                <input
                  id="contrasena"
                  name="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  placeholder="Introduce tu contraseña"
                  autoComplete="current-password"
                  aria-invalid={tipoAviso === "error" ? "true" : "false"}
                  onChange={(evento) => cambiarContrasena(evento.target.value)}
                />

                <button
                  type="button"
                  className="login__mostrar"
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  onClick={() =>
                    setMostrarContrasena((estadoActual) => !estadoActual)
                  }
                >
                  {mostrarContrasena ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="login__opciones">
              <label className="login__recordarme">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(evento) => setRecordarme(evento.target.checked)}
                />

                <span>Recordarme</span>
              </label>

              <Link to="/recuperar-contrasena" className="login__enlace">
                ¿Has olvidado la contraseña?
              </Link>
            </div>

            <button type="submit" className="login__boton" disabled={enviando}>
              {enviando ? "Comprobando datos..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="login__registro">
            <span>¿Todavía no tienes una cuenta?</span>

            <Link to="/registro" className="login__registro-enlace">
              Solicitar registro
            </Link>
          </div>
        </section>

        <footer className="login__pie">
          <span>Servicio municipal de recarga eléctrica</span>
          <span>Quer, Guadalajara</span>
        </footer>
      </section>
    </main>
  );
}

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default LoginPage;
