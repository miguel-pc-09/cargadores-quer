import { type FormEvent, useEffect, useState } from "react";

import { Link, Navigate, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import "../../styles/Login/LoginPage.css";

type Tema = "oscuro" | "claro";

function LoginPage() {
  const navigate = useNavigate();

  const { autenticado, esAdministrador, iniciarSesion, cargandoSesion } =
    useAuth();

  const [email, setEmail] = useState("");

  const [contrasena, setContrasena] = useState("");

  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [recordarme, setRecordarme] = useState(false);

  const [error, setError] = useState("");

  const [enviando, setEnviando] = useState(false);

  const [tema, setTema] = useState<Tema>(() => {
    const temaGuardado = localStorage.getItem("tema-cargaquer");

    return temaGuardado === "claro" ? "claro" : "oscuro";
  });

  useEffect(() => {
    if (tema === "claro") {
      document.documentElement.setAttribute("data-tema", "claro");
    } else {
      document.documentElement.removeAttribute("data-tema");
    }

    localStorage.setItem("tema-cargaquer", tema);
  }, [tema]);

  const cambiarTema = () => {
    setTema((temaActual) => (temaActual === "oscuro" ? "claro" : "oscuro"));
  };

  const enviarFormulario = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    setError("");

    const emailLimpio = email.trim().toLowerCase();

    if (!emailLimpio || !contrasena) {
      setError("Introduce tu correo electrónico y contraseña.");

      return;
    }

    setEnviando(true);

    try {
      const usuario = await iniciarSesion({
        email: emailLimpio,
        contrasena,
      });

      if (usuario.rol === "administrador") {
        navigate("/administracion", {
          replace: true,
        });

        return;
      }

      navigate("/panel", {
        replace: true,
      });
    } catch (errorInicio) {
      setError(
        errorInicio instanceof Error
          ? errorInicio.message
          : "No se ha podido iniciar sesión.",
      );
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoSesion) {
    return (
      <main className="login">
        <button
          type="button"
          className="login__tema"
          onClick={cambiarTema}
          aria-label={
            tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"
          }
          title={
            tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"
          }
        >
          {tema === "oscuro" ? "☀" : "☾"}
        </button>

        <section className="login__contenido">
          <div className="login__tarjeta login__tarjeta--cargando">
            <p>Comprobando sesión...</p>
          </div>
        </section>
      </main>
    );
  }

  if (autenticado) {
    return (
      <Navigate to={esAdministrador ? "/administracion" : "/panel"} replace />
    );
  }

  return (
    <main className="login">
      <button
        type="button"
        className="login__tema"
        onClick={cambiarTema}
        aria-label={
          tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"
        }
        title={tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"}
      >
        {tema === "oscuro" ? "☀" : "☾"}
      </button>

      <section className="login__contenido">
        <header className="login__cabecera">
          <div className="login__marca">
            <div className="login__icono" aria-hidden="true">
              ⚡
            </div>

            <div>
              <span className="login__ayuntamiento">
                Servicio de recarga eléctrica
              </span>

              <strong className="login__nombre">CargaQuer</strong>
            </div>
          </div>

          <p className="login__descripcion">
            Plataforma municipal para la gestión de reservas y cargas de
            vehículos eléctricos.
          </p>
        </header>

        <section className="login__tarjeta">
          <header className="login__titulo">
            <span>Acceso</span>

            <h1>Iniciar sesión</h1>

            <p>Accede a tu cuenta para gestionar tus reservas y cargas.</p>
          </header>

          <form className="login__formulario" onSubmit={enviarFormulario}>
            <div className="login__campo">
              <label htmlFor="email">Correo electrónico</label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@email.com"
                value={email}
                disabled={enviando}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </div>

            <div className="login__campo">
              <label htmlFor="contrasena">Contraseña</label>

              <div className="login__contrasena">
                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={contrasena}
                  disabled={enviando}
                  onChange={(evento) => setContrasena(evento.target.value)}
                />

                <button
                  type="button"
                  className="login__mostrar"
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
                ¿Has olvidado tu contraseña?
              </Link>
            </div>

            {error && (
              <div className="login__aviso login__aviso--error" role="alert">
                <div className="login__aviso-contenido">
                  <strong>No se ha podido iniciar sesión</strong>

                  <p>{error}</p>
                </div>
              </div>
            )}

            <button type="submit" className="login__boton" disabled={enviando}>
              {enviando ? "Accediendo..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="login__registro">
            <span>¿Todavía no tienes cuenta?</span>

            <Link to="/registro" className="login__registro-enlace">
              Crear una cuenta
            </Link>
          </div>
        </section>

        <footer className="login__pie">
          <span>Ayuntamiento de Quer</span>

          <span>Servicio de recarga eléctrica</span>
        </footer>
      </section>
    </main>
  );
}

export default LoginPage;
