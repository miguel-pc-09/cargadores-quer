export type EstadoHora = "disponible" | "pasada" | "reservada";

export interface FranjaHoraria {
  hora: string;
  estado: EstadoHora;
}

interface SelectorHoraReservaProps {
  horas: FranjaHoraria[];
  horaSeleccionada: string;
  onSeleccionar: (hora: string) => void;
}

function obtenerTextoEstado(estado: EstadoHora) {
  if (estado === "pasada") {
    return "Hora pasada";
  }

  if (estado === "reservada") {
    return "Hora reservada";
  }

  return "Hora disponible";
}

function SelectorHoraReserva({
  horas,
  horaSeleccionada,
  onSeleccionar,
}: SelectorHoraReservaProps) {
  return (
    <div>
      <div
        className="reserva-toma__horas"
        role="radiogroup"
        aria-label="Hora de inicio"
      >
        {horas.map((franja) => {
          const estaDisponible = franja.estado === "disponible";
          const estaSeleccionada =
            estaDisponible && franja.hora === horaSeleccionada;

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
