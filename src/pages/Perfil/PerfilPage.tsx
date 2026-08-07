import { type FormEvent, useEffect, useState } from "react";

import "../../styles/Perfil/PerfilPage.css";

type TipoVehiculo = "electrico" | "hibrido-enchufable";

type EstadoValidacionVehiculo = "validado" | "pendiente";

interface DatosVehiculo {
  marcaModelo: string;
  matricula: string;
  tipo: TipoVehiculo;
  estadoValidacion: EstadoValidacionVehiculo;
}

const CLAVE_VEHICULO = "cargaquer_perfil_vehiculo";

const VEHICULO_INICIAL: DatosVehiculo = {
  marcaModelo: "Hyundai Kona Eléctrico",
  matricula: "0000 AAA",
  tipo: "electrico",
  estadoValidacion: "validado",
};

function obtenerVehiculoGuardado(): DatosVehiculo {
  try {
    const vehiculoGuardado = localStorage.getItem(CLAVE_VEHICULO);

    if (!vehiculoGuardado) {
      return VEHICULO_INICIAL;
    }

    return JSON.parse(vehiculoGuardado) as DatosVehiculo;
  } catch {
    return VEHICULO_INICIAL;
  }
}

function obtenerTextoTipoVehiculo(tipo: TipoVehiculo) {
  if (tipo === "electrico") {
    return "Eléctrico";
  }

  return "Híbrido enchufable";
}

function PerfilPage() {
  const [vehiculo, setVehiculo] = useState<DatosVehiculo>(
    obtenerVehiculoGuardado,
  );

  const [editandoVehiculo, setEditandoVehiculo] = useState(false);

  const [marcaModeloTemporal, setMarcaModeloTemporal] = useState(
    vehiculo.marcaModelo,
  );

  const [matriculaTemporal, setMatriculaTemporal] = useState(
    vehiculo.matricula,
  );

  const [tipoTemporal, setTipoTemporal] = useState<TipoVehiculo>(vehiculo.tipo);

  const [notificacionesAplicacion, setNotificacionesAplicacion] =
    useState(true);

  const [notificacionesCorreo, setNotificacionesCorreo] = useState(true);

  const [mensajePerfil, setMensajePerfil] = useState("");

  useEffect(() => {
    localStorage.setItem(CLAVE_VEHICULO, JSON.stringify(vehiculo));
  }, [vehiculo]);

  const abrirEdicionVehiculo = () => {
    setMarcaModeloTemporal(vehiculo.marcaModelo);

    setMatriculaTemporal(vehiculo.matricula);

    setTipoTemporal(vehiculo.tipo);

    setMensajePerfil("");
    setEditandoVehiculo(true);
  };

  const cancelarEdicionVehiculo = () => {
    setEditandoVehiculo(false);
    setMensajePerfil("");
  };

  const guardarCambiosVehiculo = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const marcaModeloLimpio = marcaModeloTemporal.trim();

    const matriculaLimpia = matriculaTemporal.trim().toUpperCase();

    if (!marcaModeloLimpio || !matriculaLimpia) {
      setMensajePerfil("Debes completar todos los datos del vehículo.");

      return;
    }

    const haCambiado =
      marcaModeloLimpio !== vehiculo.marcaModelo ||
      matriculaLimpia !== vehiculo.matricula ||
      tipoTemporal !== vehiculo.tipo;

    if (!haCambiado) {
      setEditandoVehiculo(false);

      setMensajePerfil("No se han realizado cambios.");

      return;
    }

    setVehiculo({
      marcaModelo: marcaModeloLimpio,
      matricula: matriculaLimpia,
      tipo: tipoTemporal,
      estadoValidacion: "pendiente",
    });

    setEditandoVehiculo(false);

    setMensajePerfil(
      "El cambio de vehículo se ha enviado para validación. Hasta que sea aprobado no podrás iniciar nuevas cargas.",
    );
  };

  return (
    <section className="perfil">
      <header className="perfil__cabecera">
        <h1>Perfil</h1>
      </header>

      {mensajePerfil && (
        <div
          className={`perfil__mensaje ${
            vehiculo.estadoValidacion === "pendiente"
              ? "perfil__mensaje--aviso"
              : ""
          }`}
          role="status"
        >
          <span aria-hidden="true">
            {vehiculo.estadoValidacion === "pendiente" ? "!" : "✓"}
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
        {/* DATOS PERSONALES */}

        <section className="perfil__bloque">
          <header className="perfil__bloque-cabecera">
            <span className="perfil__etiqueta">Datos personales</span>

            <h2>Información de la cuenta</h2>
          </header>

          <div className="perfil__datos">
            <div className="perfil__dato">
              <span>Nombre</span>

              <strong>Miguel Ángel</strong>
            </div>

            <div className="perfil__dato">
              <span>Correo electrónico</span>

              <strong>miguel@example.com</strong>
            </div>

            <div className="perfil__dato">
              <span>Teléfono</span>

              <strong>600 000 000</strong>
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

        {/* VEHÍCULO */}

        <section className="perfil__bloque">
          <header className="perfil__bloque-cabecera perfil__bloque-cabecera--vehiculo">
            <div>
              <span className="perfil__etiqueta">Vehículo</span>

              <h2>Vehículo principal</h2>
            </div>

            <span
              className={`perfil__validacion perfil__validacion--${vehiculo.estadoValidacion}`}
            >
              {vehiculo.estadoValidacion === "validado"
                ? "✓ Verificado"
                : "◷ Pendiente"}
            </span>
          </header>

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
                  El Ayuntamiento debe comprobar los nuevos datos antes de
                  permitir nuevas cargas.
                </p>
              </div>
            </div>
          )}

          <div className="perfil__vehiculo">
            <div className="perfil__vehiculo-icono" aria-hidden="true">
              ⚡
            </div>

            <div className="perfil__vehiculo-info">
              <strong>{vehiculo.marcaModelo}</strong>

              <span>Vehículo principal</span>
            </div>
          </div>

          <div className="perfil__datos perfil__datos--vehiculo">
            <div className="perfil__dato">
              <span>Matrícula</span>

              <strong>{vehiculo.matricula}</strong>
            </div>

            <div className="perfil__dato">
              <span>Tipo de vehículo</span>

              <strong>{obtenerTextoTipoVehiculo(vehiculo.tipo)}</strong>
            </div>
          </div>

          {!editandoVehiculo ? (
            <button
              type="button"
              className="perfil__boton-secundario"
              onClick={abrirEdicionVehiculo}
            >
              Editar vehículo
            </button>
          ) : (
            <form
              className="perfil__formulario-vehiculo"
              onSubmit={guardarCambiosVehiculo}
            >
              <header className="perfil__formulario-cabecera">
                <span className="perfil__etiqueta">Solicitud de cambio</span>

                <h3>Editar vehículo</h3>

                <p>
                  Cualquier cambio deberá ser validado por el Ayuntamiento antes
                  de poder utilizar de nuevo los cargadores.
                </p>
              </header>

              <label className="perfil__campo">
                <span>Marca y modelo</span>

                <input
                  type="text"
                  value={marcaModeloTemporal}
                  onChange={(evento) =>
                    setMarcaModeloTemporal(evento.target.value)
                  }
                  placeholder="Ej. Hyundai Kona"
                />
              </label>

              <div className="perfil__formulario-fila">
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

                <label className="perfil__campo">
                  <span>Tipo de vehículo</span>

                  <select
                    value={tipoTemporal}
                    onChange={(evento) =>
                      setTipoTemporal(evento.target.value as TipoVehiculo)
                    }
                  >
                    <option value="electrico">Eléctrico</option>

                    <option value="hibrido-enchufable">
                      Híbrido enchufable
                    </option>
                  </select>
                </label>
              </div>

              <div className="perfil__advertencia-cambio">
                <span aria-hidden="true">!</span>

                <p>
                  Al solicitar un cambio, el vehículo quedará pendiente de
                  validación y no podrá iniciar nuevas cargas hasta que el
                  Ayuntamiento lo apruebe.
                </p>
              </div>

              <div className="perfil__formulario-acciones">
                <button
                  type="button"
                  className="perfil__boton-cancelar"
                  onClick={cancelarEdicionVehiculo}
                >
                  Cancelar
                </button>

                <button type="submit" className="perfil__boton-principal">
                  Solicitar cambio
                </button>
              </div>
            </form>
          )}
        </section>

        {/* NOTIFICACIONES */}

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

        {/* PENALIZACIONES */}

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
                Tu cuenta puede reservar y utilizar los cargadores con
                normalidad.
              </p>
            </div>
          </div>

          <button type="button" className="perfil__boton-secundario">
            Ver historial de incidencias
          </button>
        </section>

        {/* SEGURIDAD */}

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
