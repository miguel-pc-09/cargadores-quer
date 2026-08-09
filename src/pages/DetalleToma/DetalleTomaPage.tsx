import { useEffect, useState } from "react";

import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import EstadoToma from "../../components/cargadores/EstadoToma";

import { cargadoresSimulados } from "../../data/cargadores";

import useAuth from "../../hooks/useAuth";

import { obtenerCargaActivaUsuarioEnToma } from "../../services/cargasService";

import type { Carga } from "../../types/carga";

import "../../styles/DetalleToma/DetalleTomaPage.css";

function DetalleTomaPage() {
  const { cargadorId, tomaId } = useParams();

  const { usuario } = useAuth();

  const navigate = useNavigate();

  const usuarioId = usuario?.id ?? "";

  const [cargaActiva, setCargaActiva] = useState<Carga | null>(null);

  const [cargando, setCargando] = useState(true);

  const [mensajeError, setMensajeError] = useState("");

  const cargador = cargadoresSimulados.find(
    (cargadorActual) => cargadorActual.id === cargadorId,
  );

  const toma = cargador?.tomas.find((tomaActual) => tomaActual.id === tomaId);

  useEffect(() => {
    if (!usuarioId || !cargadorId || !tomaId) {
      setCargando(false);

      return;
    }

    const comprobarCarga = async () => {
      setCargando(true);

      setMensajeError("");

      try {
        const carga = await obtenerCargaActivaUsuarioEnToma(
          usuarioId,
          cargadorId,
          tomaId,
        );

        setCargaActiva(carga);
      } catch {
        setMensajeError(
          "No hemos podido comprobar el estado actual de la toma.",
        );
      } finally {
        setCargando(false);
      }
    };

    void comprobarCarga();
  }, [usuarioId, cargadorId, tomaId]);

  if (!cargador || !toma) {
    return <Navigate to="/panel/cargadores" replace />;
  }

  const irACargaActiva = () => {
    if (!cargaActiva) {
      return;
    }

    navigate(`/panel/cargas/${cargaActiva.id}`);
  };

  return (
    <section className="detalle-toma-page">
      <Link
        to={`/panel/cargadores/${cargador.id}`}
        className="detalle-toma-page__volver"
      >
        <span aria-hidden="true">←</span>

        <span>Volver al cargador</span>
      </Link>

      <header className="detalle-toma-page__cabecera">
        <span className="detalle-toma-page__etiqueta">Punto de conexión</span>

        <h1>{toma.nombre}</h1>

        <p>
          {cargador.nombre}
          {" · "}
          {cargador.direccion}
        </p>
      </header>

      {mensajeError && (
        <div className="detalle-toma-page__error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{mensajeError}</p>
        </div>
      )}

      {cargando ? (
        <div className="detalle-toma-page__cargando" role="status">
          <span className="detalle-toma-page__spinner" aria-hidden="true" />

          <p>Comprobando el estado de la toma...</p>
        </div>
      ) : (
        <>
          <section className="detalle-toma-page__panel">
            <header className="detalle-toma-page__panel-cabecera">
              <div>
                <span className="detalle-toma-page__etiqueta">
                  Estado actual
                </span>

                <h2>Información de la toma</h2>
              </div>

              <EstadoToma estado={cargaActiva ? "mi-carga" : toma.estado} />
            </header>

            <div className="detalle-toma-page__datos">
              <div>
                <span>Cargador</span>

                <strong>{cargador.nombre}</strong>
              </div>

              <div>
                <span>Toma</span>

                <strong>{toma.nombre}</strong>
              </div>

              <div>
                <span>Potencia máxima</span>

                <strong>
                  {toma.potenciaMaximaKw.toLocaleString("es-ES")} kW
                </strong>
              </div>

              <div>
                <span>Reservas</span>

                <strong>
                  {toma.permiteReserva ? "Permitidas" : "No disponibles"}
                </strong>
              </div>
            </div>

            {toma.disponibleDesde && !cargaActiva && (
              <div className="detalle-toma-page__disponibilidad">
                <span aria-hidden="true">◷</span>

                <p>
                  Disponible aproximadamente desde las{" "}
                  <strong>{toma.disponibleDesde}</strong>.
                </p>
              </div>
            )}

            {cargaActiva && (
              <div className="detalle-toma-page__mi-carga">
                <span
                  className="detalle-toma-page__mi-carga-icono"
                  aria-hidden="true"
                >
                  ⚡
                </span>

                <div>
                  <strong>Tienes una carga activa en esta toma</strong>

                  <p>
                    Puedes consultar el progreso, la energía suministrada y
                    detener la sesión desde la pantalla de carga.
                  </p>
                </div>
              </div>
            )}

            {cargaActiva ? (
              <button
                type="button"
                className="detalle-toma-page__boton detalle-toma-page__boton--activa"
                onClick={irACargaActiva}
              >
                <span aria-hidden="true">⚡</span>

                <span>Ver mi carga</span>
              </button>
            ) : toma.estado === "fuera-servicio" ? (
              <div className="detalle-toma-page__fuera-servicio">
                Esta toma no está disponible temporalmente.
              </div>
            ) : (
              <Link
                to={`/panel/cargadores/${cargador.id}/tomas/${toma.id}/reservar`}
                className="detalle-toma-page__boton"
              >
                Consultar horarios y reservar
              </Link>
            )}
          </section>
        </>
      )}
    </section>
  );
}

export default DetalleTomaPage;
