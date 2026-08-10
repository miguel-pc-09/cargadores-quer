import { type FormEvent, useEffect, useState } from "react";

import useAuth from "../../hooks/useAuth";

import {
  actualizarMatriculaVehiculo,
  obtenerVehiculoUsuario,
} from "../../services/usersService";

import type { DatosVehiculo } from "../../types/user";

import "../../styles/Perfil/PerfilPage.css";

function PerfilPage() {
  const { usuario } = useAuth();

  const [vehiculo, setVehiculo] = useState<DatosVehiculo | null>(null);

  const [cargandoVehiculo, setCargandoVehiculo] = useState(true);

  const [editandoVehiculo, setEditandoVehiculo] = useState(false);

  const [matriculaTemporal, setMatriculaTemporal] = useState("");

  const [notificacionesAplicacion, setNotificacionesAplicacion] =
    useState(true);

  const [notificacionesCorreo, setNotificacionesCorreo] = useState(true);

  const [mensajePerfil, setMensajePerfil] = useState("");

  const [guardandoVehiculo, setGuardandoVehiculo] = useState(false);

  const nombreCompleto = usuario
    ? `${usuario.nombre} ${usuario.apellidos}`.trim()
    : "Usuario";

  const correo = usuario?.email ?? "No disponible";

  const telefono = usuario?.telefono ?? "No disponible";

  useEffect(() => {
    let activo = true;

    async function cargarVehiculo() {
      if (!usuario?.id) {
        if (activo) {
          setVehiculo(null);
          setCargandoVehiculo(false);
        }

        return;
      }

      try {
        setCargandoVehiculo(true);

        const vehiculoObtenido = await obtenerVehiculoUsuario(usuario.id);

        if (!activo) {
          return;
        }

        setVehiculo(vehiculoObtenido);

        setMatriculaTemporal(vehiculoObtenido?.matricula ?? "");
      } catch (error) {
        if (!activo) {
          return;
        }

        setVehiculo(null);

        setMensajePerfil(
          error instanceof Error
            ? error.message
            : "No se ha podido cargar el vehículo.",
        );
      } finally {
        if (activo) {
          setCargandoVehiculo(false);
        }
      }
    }

    void cargarVehiculo();

    return () => {
      activo = false;
    };
  }, [usuario?.id]);

  const abrirEdicionVehiculo = () => {
    if (!vehiculo) {
      return;
    }

    setMatriculaTemporal(vehiculo.matricula);

    setMensajePerfil("");

    setEditandoVehiculo(true);
  };

  const cancelarEdicionVehiculo = () => {
    setMatriculaTemporal(vehiculo?.matricula ?? "");

    setEditandoVehiculo(false);

    setMensajePerfil("");
  };

  const guardarCambiosVehiculo = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    if (!usuario?.id || !vehiculo || guardandoVehiculo) {
      return;
    }

    const matriculaLimpia = matriculaTemporal
      .trim()
      .toUpperCase()
      .replace(/[\s-]/g, "");

    if (!matriculaLimpia) {
      setMensajePerfil("Debes introducir la matrícula.");

      return;
    }

    const matriculaActual = vehiculo.matricula
      .trim()
      .toUpperCase()
      .replace(/[\s-]/g, "");

    if (matriculaLimpia === matriculaActual) {
      setEditandoVehiculo(false);

      setMensajePerfil("No se han realizado cambios.");

      return;
    }

    try {
      setGuardandoVehiculo(true);

      const vehiculoActualizado = await actualizarMatriculaVehiculo(
        usuario.id,
        matriculaLimpia,
      );

      setVehiculo(vehiculoActualizado);

      setMatriculaTemporal(vehiculoActualizado.matricula);

      setEditandoVehiculo(false);

      setMensajePerfil(
        "El cambio de matrícula se ha enviado para validación. Hasta que sea aprobado no podrás realizar nuevas reservas ni iniciar cargas.",
      );
    } catch (error) {
      setMensajePerfil(
        error instanceof Error
          ? error.message
          : "No se ha podido actualizar la matrícula.",
      );
    } finally {
      setGuardandoVehiculo(false);
    }
  };

  return (
    <section className="perfil">
      <header className="perfil__cabecera">
        <h1>Perfil</h1>
      </header>

      {mensajePerfil && (
        <div
          className={`perfil__mensaje ${
            vehiculo?.estadoValidacion !== "validado"
              ? "perfil__mensaje--aviso"
              : ""
          }`}
          role="status"
        >
          <span aria-hidden="true">
            {vehiculo?.estadoValidacion === "validado" ? "✓" : "!"}
          </span>

          <p>{mensajePerfil}</p>

          <button
            type="button"
            aria-label="Cerrar mensaje"
            onClick={() => setMensajePerfil("")}
          >
            ×
          </button>
        </div>
      )}

      <div className="perfil__contenido">
        <section className="perfil__bloque">
          <header className="perfil__bloque-cabecera">
            <span className="perfil__etiqueta">Datos personales</span>

            <h2>Información de la cuenta</h2>
          </header>

          <div className="perfil__datos">
            <div className="perfil__dato">
              <span>Nombre</span>

              <strong>{nombreCompleto || "No disponible"}</strong>
            </div>

            <div className="perfil__dato">
              <span>Correo electrónico</span>

              <strong>{correo}</strong>
            </div>

            <div className="perfil__dato">
              <span>Teléfono</span>

              <strong>{telefono}</strong>
            </div>

            <div className="perfil__dato">
              <span>Estado de la cuenta</span>

              <strong className="perfil__estado perfil__estado--correcto">
                Verificada
              </strong>
            </div>
          </div>

          <button type="button" className="perfil__boton-secundario">
            Editar datos personales
          </button>
        </section>

        <section className="perfil__bloque">
          <header className="perfil__bloque-cabecera perfil__bloque-cabecera--vehiculo">
            <div>
              <span className="perfil__etiqueta">Vehículo</span>

              <h2>Vehículo principal</h2>
            </div>

            {vehiculo && (
              <span
                className={`perfil__validacion perfil__validacion--${vehiculo.estadoValidacion}`}
              >
                {vehiculo.estadoValidacion === "validado"
                  ? "✓ Verificado"
                  : vehiculo.estadoValidacion === "pendiente"
                    ? "◷ Pendiente"
                    : "✕ Rechazado"}
              </span>
            )}
          </header>

          {cargandoVehiculo ? (
            <p>Cargando vehículo...</p>
          ) : !vehiculo ? (
            <div className="perfil__aviso-validacion">
              <span
                className="perfil__aviso-validacion-icono"
                aria-hidden="true"
              >
                !
              </span>

              <div>
                <strong>Vehículo no registrado</strong>

                <p>
                  No hay ninguna matrícula asociada actualmente a esta cuenta.
                </p>
              </div>
            </div>
          ) : (
            <>
              {vehiculo.estadoValidacion === "pendiente" && (
                <div className="perfil__aviso-validacion">
                  <span
                    className="perfil__aviso-validacion-icono"
                    aria-hidden="true"
                  >
                    !
                  </span>

                  <div>
                    <strong>Vehículo pendiente de validación</strong>

                    <p>
                      El Ayuntamiento debe comprobar la matrícula antes de
                      permitir nuevas reservas o cargas.
                    </p>
                  </div>
                </div>
              )}

              {vehiculo.estadoValidacion === "rechazado" && (
                <div className="perfil__aviso-validacion">
                  <span
                    className="perfil__aviso-validacion-icono"
                    aria-hidden="true"
                  >
                    !
                  </span>

                  <div>
                    <strong>Vehículo no validado</strong>

                    <p>
                      La matrícula no ha sido aprobada. Revisa los datos o
                      contacta con el Ayuntamiento.
                    </p>
                  </div>
                </div>
              )}

              <div className="perfil__vehiculo">
                <div className="perfil__vehiculo-icono" aria-hidden="true">
                  ⚡
                </div>

                <div className="perfil__vehiculo-info">
                  <strong>{vehiculo.matricula}</strong>

                  <span>Vehículo principal</span>
                </div>
              </div>

              <div className="perfil__datos perfil__datos--vehiculo">
                <div className="perfil__dato">
                  <span>Matrícula</span>

                  <strong>{vehiculo.matricula}</strong>
                </div>
              </div>

              {!editandoVehiculo ? (
                <button
                  type="button"
                  className="perfil__boton-secundario"
                  onClick={abrirEdicionVehiculo}
                >
                  Editar matrícula
                </button>
              ) : (
                <form
                  className="perfil__formulario-vehiculo"
                  onSubmit={guardarCambiosVehiculo}
                >
                  <header className="perfil__formulario-cabecera">
                    <span className="perfil__etiqueta">
                      Solicitud de cambio
                    </span>

                    <h3>Editar matrícula</h3>

                    <p>
                      El cambio deberá ser validado por el Ayuntamiento antes de
                      poder volver a reservar o iniciar cargas.
                    </p>
                  </header>

                  <label className="perfil__campo">
                    <span>Matrícula</span>

                    <input
                      type="text"
                      value={matriculaTemporal}
                      onChange={(evento) =>
                        setMatriculaTemporal(evento.target.value)
                      }
                      placeholder="0000 AAA"
                      maxLength={10}
                    />
                  </label>

                  <div className="perfil__advertencia-cambio">
                    <span aria-hidden="true">!</span>

                    <p>
                      Al solicitar el cambio, la matrícula quedará pendiente de
                      validación hasta que el Ayuntamiento la apruebe.
                    </p>
                  </div>

                  <div className="perfil__formulario-acciones">
                    <button
                      type="button"
                      className="perfil__boton-cancelar"
                      onClick={cancelarEdicionVehiculo}
                      disabled={guardandoVehiculo}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="perfil__boton-principal"
                      disabled={guardandoVehiculo}
                    >
                      {guardandoVehiculo ? "Enviando..." : "Solicitar cambio"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>

        <section className="perfil__bloque">
          <header className="perfil__bloque-cabecera">
            <span className="perfil__etiqueta">Avisos</span>

            <h2>Notificaciones</h2>
          </header>

          <div className="perfil__preferencias">
            <label className="perfil__preferencia">
              <div>
                <strong>Notificaciones en la aplicación</strong>

                <span>Avisos sobre reservas, cargas e incidencias.</span>
              </div>

              <input
                type="checkbox"
                checked={notificacionesAplicacion}
                onChange={(evento) =>
                  setNotificacionesAplicacion(evento.target.checked)
                }
              />
            </label>

            <label className="perfil__preferencia">
              <div>
                <strong>Avisos por correo electrónico</strong>

                <span>
                  Recordatorios antes de las reservas y avisos importantes.
                </span>
              </div>

              <input
                type="checkbox"
                checked={notificacionesCorreo}
                onChange={(evento) =>
                  setNotificacionesCorreo(evento.target.checked)
                }
              />
            </label>
          </div>
        </section>

        <section className="perfil__bloque">
          <header className="perfil__bloque-cabecera">
            <span className="perfil__etiqueta">Uso responsable</span>

            <h2>Penalizaciones e incidencias</h2>
          </header>

          <div className="perfil__estado-cuenta">
            <div className="perfil__estado-cuenta-icono" aria-hidden="true">
              ✓
            </div>

            <div>
              <strong>Sin penalizaciones activas</strong>

              <p>
                Tu cuenta puede utilizar el servicio con normalidad siempre que
                el vehículo esté validado.
              </p>
            </div>
          </div>

          <button type="button" className="perfil__boton-secundario">
            Ver historial de incidencias
          </button>
        </section>

        <section className="perfil__bloque">
          <header className="perfil__bloque-cabecera">
            <span className="perfil__etiqueta">Seguridad</span>

            <h2>Acceso a la cuenta</h2>
          </header>

          <div className="perfil__acciones-seguridad">
            <button type="button" className="perfil__boton-secundario">
              Cambiar contraseña
            </button>

            <button type="button" className="perfil__boton-peligro">
              Cerrar sesión en todos los dispositivos
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default PerfilPage;
