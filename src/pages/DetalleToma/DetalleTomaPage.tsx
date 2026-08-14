import { useEffect, useState } from "react";

import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import EstadoToma from "../../components/cargadores/EstadoToma";

import useAuth from "../../hooks/useAuth";

import { obtenerCargaActivaUsuarioEnToma } from "../../services/cargasService";

import { obtenerCargadorPorId } from "../../services/chargersService";

import type { Carga } from "../../types/carga";
import type { Cargador, TomaCargador } from "../../types/charger";

import "../../styles/DetalleToma/DetalleTomaPage.css";

function DetalleTomaPage() {
  const { cargadorId, tomaId } = useParams();

  const { usuario } = useAuth();

  const navigate = useNavigate();

  const usuarioId = usuario?.id ?? "";

  const [cargador, setCargador] = useState<Cargador | null>(null);

  const [toma, setToma] = useState<TomaCargador | null>(null);

  const [cargaActiva, setCargaActiva] = useState<Carga | null>(null);

  const [cargandoDatos, setCargandoDatos] = useState(true);

  const [mensajeError, setMensajeError] = useState("");

  const [noEncontrado, setNoEncontrado] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      if (!cargadorId || !tomaId) {
        if (activo) {
          setNoEncontrado(true);

          setCargandoDatos(false);
        }

        return;
      }

      try {
        setCargandoDatos(true);

        setMensajeError("");

        setNoEncontrado(false);

        const cargadorObtenido = await obtenerCargadorPorId(cargadorId);

        if (!activo) {
          return;
        }

        if (!cargadorObtenido) {
          setCargador(null);

          setToma(null);

          setNoEncontrado(true);

          return;
        }

        const tomaObtenida =
          cargadorObtenido.tomas.find(
            (tomaActual) => tomaActual.id === tomaId,
          ) ?? null;

        if (!tomaObtenida) {
          setCargador(cargadorObtenido);

          setToma(null);

          setNoEncontrado(true);

          return;
        }

        setCargador(cargadorObtenido);

        setToma(tomaObtenida);

        if (!usuarioId) {
          setCargaActiva(null);

          return;
        }

        const carga = await obtenerCargaActivaUsuarioEnToma(
          usuarioId,
          cargadorId,
          tomaId,
        );

        if (!activo) {
          return;
        }

        setCargaActiva(carga);
      } catch (error) {
        if (!activo) {
          return;
        }

        setMensajeError(
          error instanceof Error
            ? error.message
            : "No hemos podido comprobar el estado actual de la toma.",
        );
      } finally {
        if (activo) {
          setCargandoDatos(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, [usuarioId, cargadorId, tomaId]);

  if (!cargandoDatos && noEncontrado) {
    return <Navigate to="/panel/cargadores" replace />;
  }

  function irACargaActiva() {
    if (!cargaActiva) {
      return;
    }

    navigate(`/panel/cargas/${cargaActiva.id}`);
  }

  if (cargandoDatos || !cargador || !toma) {
    return (
      <section className="detalle-toma-page">
        <Link
          to={
            cargadorId ? `/panel/cargadores/${cargadorId}` : "/panel/cargadores"
          }
          className="detalle-toma-page__volver"
        >
          <span aria-hidden="true">←</span>

          <span>Volver al cargador</span>
        </Link>

        {mensajeError ? (
          <div className="detalle-toma-page__error" role="alert">
            <span aria-hidden="true">!</span>

            <p>{mensajeError}</p>
          </div>
        ) : (
          <div className="detalle-toma-page__cargando" role="status">
            <span className="detalle-toma-page__spinner" aria-hidden="true" />

            <p>Comprobando el estado de la toma...</p>
          </div>
        )}
      </section>
    );
  }

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

      <section className="detalle-toma-page__panel">
        <header className="detalle-toma-page__panel-cabecera">
          <div>
            <span className="detalle-toma-page__etiqueta">Estado actual</span>

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

            <strong>{toma.potenciaMaximaKw.toLocaleString("es-ES")} kW</strong>
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
                Puedes consultar el progreso, la energía suministrada y detener
                la sesión desde la pantalla de carga.
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
        ) : toma.permiteReserva ? (
          <Link
            to={`/panel/cargadores/${cargador.id}/tomas/${toma.id}/reservar`}
            className="detalle-toma-page__boton"
          >
            Consultar horarios y reservar
          </Link>
        ) : (
          <div className="detalle-toma-page__fuera-servicio">
            Esta toma no permite reservas.
          </div>
        )}
      </section>
    </section>
  );
}

export default DetalleTomaPage;
