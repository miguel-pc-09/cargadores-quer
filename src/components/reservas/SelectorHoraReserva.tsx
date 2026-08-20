// Estados posibles de una franja horaria.
export type EstadoHora = "disponible" | "pasada" | "reservada";

// Datos de cada franja horaria.
export interface FranjaHoraria {
  hora: string;
  estado: EstadoHora;
}

// Propiedades del selector de hora.
interface SelectorHoraReservaProps {
  horas: FranjaHoraria[];
  horaSeleccionada: string;
  onSeleccionar: (hora: string) => void;
}

// Función para mostrar el estado de una hora.
function obtenerTextoEstado(estado: EstadoHora) {
  if (estado === "pasada") {
    return "Hora pasada";
  }

  if (estado === "reservada") {
    return "Hora reservada";
  }

  return "Hora disponible";
}

// Componente para seleccionar la hora.
function SelectorHoraReserva({
  horas,
  horaSeleccionada,
  onSeleccionar,
}: SelectorHoraReservaProps) {
  return (
    <div>
      {/* Listado de franjas horarias. */}
      <div
        className="reserva-toma__horas"
        role="radiogroup"
        aria-label="Hora de inicio"
      >
        {horas.map((franja) => {
          // Comprueba si la hora está disponible.
          const estaDisponible = franja.estado === "disponible";

          // Comprueba si la hora está seleccionada.
          const estaSeleccionada =
            estaDisponible && franja.hora === horaSeleccionada;

          // Clases según el estado de la hora.
          const clases = [
            "reserva-toma__hora",
            estaSeleccionada ? "reserva-toma__hora--activa" : "",
            !estaDisponible ? "reserva-toma__hora--no-disponible" : "",
            franja.estado === "pasada" ? "reserva-toma__hora--pasada" : "",
            franja.estado === "reservada"
              ? "reserva-toma__hora--reservada"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={franja.hora}
              type="button"
              role="radio"
              aria-checked={estaSeleccionada}
              aria-label={`${franja.hora}. ${obtenerTextoEstado(
                franja.estado,
              )}`}
              title={obtenerTextoEstado(franja.estado)}
              className={clases}
              disabled={!estaDisponible}
              onClick={() => {
                if (estaDisponible) {
                  onSeleccionar(franja.hora);
                }
              }}
            >
              {franja.hora}
            </button>
          );
        })}
      </div>

      {/* Leyenda de disponibilidad. */}
      <div
        className="reserva-toma__leyenda-horas"
        aria-label="Leyenda de disponibilidad"
      >
        <span>
          <i className="reserva-toma__leyenda-indicador reserva-toma__leyenda-indicador--disponible" />
          Disponible
        </span>

        <span>
          <i className="reserva-toma__leyenda-indicador reserva-toma__leyenda-indicador--seleccionada" />
          Seleccionada
        </span>

        <span>
          <i className="reserva-toma__leyenda-indicador reserva-toma__leyenda-indicador--bloqueada" />
          No disponible
        </span>
      </div>
    </div>
  );
}

export default SelectorHoraReserva;
