import { Link, Navigate, useParams } from "react-router-dom";

import EstadoConexionCargador from "../../components/detalleCargador/EstadoConexionCargador";
import TarjetaTomaDetalle from "../../components/detalleCargador/TarjetaTomaDetalle";

import { cargadoresSimulados } from "../../data/cargadores";

import "../../styles/DetalleCargador/DetalleCargadorPage.css";

function DetalleCargadorPage() {
  const { cargadorId } = useParams();

  const cargador = cargadoresSimulados.find(
    (cargadorActual) => cargadorActual.id === cargadorId,
  );

  if (!cargador) {
    return <Navigate to="/panel/cargadores" replace />;
  }

  return (
    <section className="detalle-cargador-page">
      <Link to="/panel/cargadores" className="detalle-cargador-page__volver">
        <span aria-hidden="true">←</span>
        <span>Volver a cargadores</span>
      </Link>

      <header className="detalle-cargador-page__cabecera">
        <span className="detalle-cargador-page__etiqueta">
          Punto de carga municipal
        </span>

        <h1>{cargador.nombre}</h1>

        <p>{cargador.direccion}</p>
      </header>

      <EstadoConexionCargador
        estado={cargador.estado}
        fabricante={cargador.fabricante}
        gestor={cargador.gestor}
      />

      <section className="detalle-cargador-page__tomas">
        <header className="detalle-cargador-page__tomas-cabecera">
          <div>
            <span className="detalle-cargador-page__etiqueta">
              Tomas del cargador
            </span>

            <h2>Selecciona una toma</h2>
          </div>

          <span className="detalle-cargador-page__contador">
            {cargador.tomas.length}{" "}
            {cargador.tomas.length === 1 ? "toma" : "tomas"}
          </span>
        </header>

        <div className="detalle-cargador-page__tomas-listado">
          {cargador.tomas.map((toma) => (
            <TarjetaTomaDetalle
              key={toma.id}
              cargadorId={cargador.id}
              toma={toma}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

export default DetalleCargadorPage;
