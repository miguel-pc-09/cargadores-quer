import { Link } from "react-router-dom";

import type { Cargador } from "../../types/charger";

import EstadoToma from "./EstadoToma";

// Propiedades de la tarjeta del cargador.
interface TarjetaCargadorProps {
  cargador: Cargador;
}

// Componente para mostrar un cargador y sus tomas.
function TarjetaCargador({ cargador }: TarjetaCargadorProps) {
  return (
    <article className="tarjeta-cargador">
      <header className="tarjeta-cargador__cabecera">
        <div className="tarjeta-cargador__identidad">
          <span className="tarjeta-cargador__icono" aria-hidden="true">
            ⚡
          </span>

          <div>
            <h2>{cargador.nombre}</h2>

            <p>{cargador.direccion}</p>
          </div>
        </div>

        {/* Estado de conexión del cargador. */}
        <span
          className={`tarjeta-cargador__conexion tarjeta-cargador__conexion--${cargador.estado}`}
        >
          <span aria-hidden="true">●</span>

          {cargador.estado === "conectado"
            ? "Conectado"
            : cargador.estado === "mantenimiento"
              ? "Mantenimiento"
              : "Desconectado"}
        </span>
      </header>

      {/* Listado de tomas del cargador. */}
      <div className="tarjeta-cargador__tomas">
        {cargador.tomas.length === 0 ? (
          <div className="tarjeta-cargador__toma">
            <div className="tarjeta-cargador__toma-informacion">
              <strong>Sin tomas disponibles</strong>

              <span>No hay tomas configuradas para este cargador.</span>
            </div>
          </div>
        ) : (
          cargador.tomas.map((toma) => (
            <div key={toma.id} className="tarjeta-cargador__toma">
              <div className="tarjeta-cargador__toma-informacion">
                <strong>{toma.nombre}</strong>

                <span>
                  Hasta {toma.potenciaMaximaKw.toLocaleString("es-ES")} kW
                </span>
              </div>

              <div className="tarjeta-cargador__toma-estado">
                <EstadoToma estado={toma.estado} />

                {toma.disponibleDesde && (
                  <span className="tarjeta-cargador__disponible">
                    Disponible desde las {toma.disponibleDesde}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Acceso al detalle del cargador. */}
      <footer className="tarjeta-cargador__pie">
        <div>{cargador.permiteReserva && <span>Admite reserva</span>}</div>

        <Link
          to={`/panel/cargadores/${cargador.id}`}
          className="tarjeta-cargador__boton"
        >
          Ver cargador
          <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </article>
  );
}

export default TarjetaCargador;
