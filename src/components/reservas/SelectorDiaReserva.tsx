// Datos disponibles para cada día.
interface DiaDisponible {
  valor: string;
  nombreDia: string;
  numeroDia: string;
  etiqueta: string;
}

// Propiedades del selector de día.
interface SelectorDiaReservaProps {
  dias: DiaDisponible[];
  diaSeleccionado: string;
  onSeleccionar: (dia: string) => void;
}

// Componente para seleccionar el día.
function SelectorDiaReserva({
  dias,
  diaSeleccionado,
  onSeleccionar,
}: SelectorDiaReservaProps) {
  return (
    <div
      className="reserva-toma__dias"
      role="radiogroup"
      aria-label="Día de la reserva"
    >
      {/* Listado de días disponibles. */}
      {dias.map((dia) => {
        // Comprueba si el día está seleccionado.
        const seleccionado = dia.valor === diaSeleccionado;

        return (
          <button
            key={dia.valor}
            type="button"
            role="radio"
            aria-checked={seleccionado}
            className={`reserva-toma__dia${
              seleccionado ? " reserva-toma__dia--activo" : ""
            }`}
            onClick={() => onSeleccionar(dia.valor)}
          >
            <span>{dia.etiqueta}</span>
            <strong>{dia.nombreDia}</strong>
            <small>{dia.numeroDia}</small>
          </button>
        );
      })}
    </div>
  );
}

export default SelectorDiaReserva;
export type { DiaDisponible };
