import { type FormEvent, useState } from "react";

import { Link, Navigate, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import "../../styles/Login/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const { autenticado, esAdministrador, iniciarSesion, cargandoSesion } =
    useAuth();

  const [email, setEmail] = useState("");

  const [contrasena, setContrasena] = useState("");

  const [error, setError] = useState("");

  const [enviando, setEnviando] = useState(false);

  const enviarFormulario = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    setError("");

    const emailLimpio = email.trim().toLowerCase();

    const contrasenaLimpia = contrasena.trim();

    if (!emailLimpio || !contrasenaLimpia) {
      setError("Introduce tu correo electrónico y contraseña.");

      return;
    }

    setEnviando(true);

    try {
      const usuario = await iniciarSesion({
        email: emailLimpio,
        contrasena: contrasenaLimpia,
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
        <section className="login__contenedor">
          <div className="login__cargando">
            <span className="login__spinner" />

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
      <section className="login__contenedor">
        <header className="login__marca">
          <div className="login__logo" aria-hidden="true">
            ⚡
          </div>

          <div>
            <span className="login__marca-etiqueta">
              Servicio de recarga eléctrica
            </span>

            <strong>CargaQuer</strong>
          </div>
        </header>

        <section className="login__tarjeta">
          <header className="login__cabecera">
            <span className="login__etiqueta">Acceso</span>

            <h1>Iniciar sesión</h1>

            <p>Accede a tu cuenta para gestionar tus reservas y cargas.</p>
          </header>

          <form className="login__formulario" onSubmit={enviarFormulario}>
            <label className="login__campo">
              <span>Correo electrónico</span>

              <input
                type="email"
                autoComplete="email"
                placeholder="usuario@email.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                disabled={enviando}
              />
            </label>

            <label className="login__campo">
              <span>Contraseña</span>

              <input
                type="password"
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                disabled={enviando}
              />
            </label>

            {error && (
              <div className="login__error" role="alert">
                <span aria-hidden="true">!</span>

                <p>{error}</p>
              </div>
            )}

            <Link to="/recuperar-contrasena" className="login__recuperar">
              ¿Has olvidado tu contraseña?
            </Link>

            <button type="submit" className="login__boton" disabled={enviando}>
              {enviando ? "Accediendo..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="login__separador">
            <span />

            <p>¿Todavía no tienes cuenta?</p>

            <span />
          </div>

          <Link to="/registro" className="login__registro">
            Crear una cuenta
          </Link>
        </section>
      </section>
    </main>
  );
}

export default LoginPage;
