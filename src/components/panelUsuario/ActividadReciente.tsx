import { useState } from "react";

import type {
  ActividadUsuario,
  TipoActividadUsuario,
} from "../../types/panelUsuario";

// Propiedades de la actividad reciente.
interface ActividadRecienteProps {
  actividades: ActividadUsuario[];
}

// Iconos para cada tipo de actividad.
const iconosActividad: Record<TipoActividadUsuario, string> = {
  "carga-iniciada": "⚡",
  "carga-finalizada": "✓",
  "reserva-creada": "▣",
  "reserva-cancelada": "×",
};

// Componente para mostrar la actividad reciente.
function ActividadReciente({ actividades }: ActividadRecienteProps) {
  // Estado para mostrar más actividades.
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Limita las actividades visibles.
  const actividadesVisibles = mostrarTodas
    ? actividades.slice(0, 10)
    : actividades.slice(0, 5);

  // Muestra el estado sin actividad.
  if (actividades.length === 0) {
    return (
      <section className="actividad-reciente">
        <div className="actividad-reciente__cabecera">
          <div>
            <span className="actividad-reciente__etiqueta">
              Últimos movimientos
            </span>

            <h2>Actividad reciente</h2>
          </div>
        </div>

        <div className="actividad-reciente__vacia">
          <span aria-hidden="true">⚡</span>

          <div>
            <strong>Todavía no tienes actividad</strong>

            <p>
              Aquí aparecerán tus próximas reservas y las cargas que realices.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="actividad-reciente">
      <div className="actividad-reciente__cabecera">
        <div>
          <span className="actividad-reciente__etiqueta">
            Últimos movimientos
          </span>

          <h2>Actividad reciente</h2>
        </div>

        <span className="actividad-reciente__contador">
          {Math.min(actividades.length, 10)} movimientos
        </span>
      </div>

      {/* Lista de actividades. */}
      <div className="actividad-reciente__lista">
        {actividadesVisibles.map((actividad) => (
          <article
            key={actividad.id}
            className={`actividad-item actividad-item--${actividad.tipo}`}
          >
            <span className="actividad-item__icono" aria-hidden="true">
              {iconosActividad[actividad.tipo]}
            </span>

            <div className="actividad-item__contenido">
              <div className="actividad-item__titulo">
                <strong>{actividad.titulo}</strong>

                <span>
                  {actividad.fecha} · {actividad.hora}
                </span>
              </div>

              <p className="actividad-item__ubicacion">
                {actividad.ubicacion} · {actividad.toma}
              </p>

              <p className="actividad-item__detalle">{actividad.detalle}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Botón para ampliar la actividad. */}
      {actividades.length > 5 && (
        <button
          type="button"
          className="actividad-reciente__boton"
          onClick={() => setMostrarTodas((estadoActual) => !estadoActual)}
        >
          {mostrarTodas
            ? "Mostrar menos actividad"
            : "Ver las 10 últimas actividades"}
        </button>
      )}
    </section>
  );
}

export default ActividadReciente;
