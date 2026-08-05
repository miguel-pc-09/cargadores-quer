import { Link } from "react-router-dom";

import type { TomaCargador } from "../../types/charger";

import EstadoToma from "../cargadores/EstadoToma";

interface TarjetaTomaDetalleProps {
  cargadorId: string;
  toma: TomaCargador;
}

function obtenerTextoBoton(toma: TomaCargador) {
  switch (toma.estado) {
    case "libre":
      return "Reservar esta toma";

    case "ocupada":
    case "reservada":
      return "Consultar horarios";

    case "mi-carga":
      return "Ver mi carga";

    case "fuera-servicio":
      return null;

    default:
      return null;
  }
}

function TarjetaTomaDetalle({ cargadorId, toma }: TarjetaTomaDetalleProps) {
  const textoBoton = obtenerTextoBoton(toma);

  const ruta =
    toma.estado === "mi-carga"
      ? `/panel/cargadores/${cargadorId}/tomas/${toma.id}`
      : `/panel/cargadores/${cargadorId}/tomas/${toma.id}/reservar`;

  return (
    <article className="toma-detalle">
      <header className="toma-detalle__cabecera">
        <div>
          <span className="toma-detalle__etiqueta">Punto de conexión</span>

          <h3>{toma.nombre}</h3>
        </div>

        <EstadoToma estado={toma.estado} />
      </header>

      <div className="toma-detalle__informacion">
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

      {toma.disponibleDesde && (
        <div className="toma-detalle__disponibilidad">
          <span aria-hidden="true">◷</span>

          <span>
            Disponible aproximadamente desde las{" "}
            <strong>{toma.disponibleDesde}</strong>
          </span>
        </div>
      )}

      {toma.estado === "mi-carga" && (
        <div className="toma-detalle__carga-activa">
          <div>
            <span>Potencia</span>
            <strong>6,5 kW</strong>
          </div>

          <div>
            <span>Consumo</span>
            <strong>2,52 kWh</strong>
          </div>

          <div>
            <span>Duración</span>
            <strong>23 min</strong>
          </div>
        </div>
      )}

      {toma.estado === "fuera-servicio" && (
        <p className="toma-detalle__fuera-servicio">
          Esta toma no está disponible temporalmente.
        </p>
      )}

      {textoBoton && (
        <Link
          to={ruta}
          className={`toma-detalle__boton toma-detalle__boton--${toma.estado}`}
        >
          {textoBoton}

          <span aria-hidden="true">→</span>
        </Link>
      )}
    </article>
  );
}

export default TarjetaTomaDetalle;
