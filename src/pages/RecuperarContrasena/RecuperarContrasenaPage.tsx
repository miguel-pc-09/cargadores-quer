import { type FormEvent, useState } from "react";

import { Link } from "react-router-dom";

import "../../styles/RecuperarContrasena/RecuperarContrasenaPage.css";

function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");

  const [enviando, setEnviando] = useState(false);

  const [enviado, setEnviado] = useState(false);

  const [error, setError] = useState("");

  const enviarFormulario = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    const emailLimpio = email.trim().toLowerCase();

    setError("");

    if (!emailLimpio) {
      setError("Introduce tu correo electrónico.");

      return;
    }

    setEnviando(true);

    /*
     * Simulación temporal.
     *
     * Cuando conectemos Supabase, aquí se
     * sustituirá por el envío real del correo
     * de recuperación de contraseña.
     */
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 700);
    });

    setEnviando(false);
    setEnviado(true);
  };

  return (
    <main className="recuperar">
      <section className="recuperar__contenido">
        <header className="recuperar__marca">
          <div className="recuperar__logo" aria-hidden="true">
            ⚡
          </div>

          <div>
            <span>Servicio de recarga eléctrica</span>

            <strong>CargaQuer</strong>
          </div>
        </header>

        <section className="recuperar__tarjeta">
          {!enviado ? (
            <>
              <header className="recuperar__cabecera">
                <span className="recuperar__etiqueta">Seguridad</span>

                <h1>Recuperar contraseña</h1>

                <p>
                  Introduce el correo electrónico asociado a tu cuenta y te
                  enviaremos las instrucciones para crear una nueva contraseña.
                </p>
              </header>

              <form
                className="recuperar__formulario"
                onSubmit={enviarFormulario}
              >
                <label className="recuperar__campo">
                  <span>Correo electrónico</span>

                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@email.com"
                    value={email}
                    disabled={enviando}
                    onChange={(evento) => setEmail(evento.target.value)}
                  />
                </label>

                {error && (
                  <div className="recuperar__error" role="alert">
                    <span aria-hidden="true">!</span>

                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="recuperar__boton"
                  disabled={enviando}
                >
                  {enviando ? "Enviando..." : "Enviar instrucciones"}
                </button>
              </form>
            </>
          ) : (
            <div className="recuperar__enviado">
              <div className="recuperar__enviado-icono" aria-hidden="true">
                ✓
              </div>

              <span className="recuperar__etiqueta">Solicitud enviada</span>

              <h1>Revisa tu correo</h1>

              <p>
                Si existe una cuenta asociada a <strong>{email.trim()}</strong>,
                recibirás las instrucciones para restablecer tu contraseña.
              </p>

              <p className="recuperar__nota">
                Por seguridad no indicamos si el correo está registrado en el
                servicio.
              </p>

              <button
                type="button"
                className="recuperar__reenviar"
                onClick={() => {
                  setEnviado(false);
                  setError("");
                }}
              >
                Utilizar otro correo
              </button>
            </div>
          )}

          <Link to="/login" className="recuperar__volver">
            <span aria-hidden="true">←</span>

            <span>Volver a iniciar sesión</span>
          </Link>
        </section>
      </section>
    </main>
  );
}

export default RecuperarContrasenaPage;
