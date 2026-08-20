// Propiedades del control de duración.
interface ControlDuracionReservaProps {
  duracionMinutos: number;
  minimoMinutos: number;
  maximoMinutos: number;
  incrementoMinutos: number;
  onCambiar: (duracion: number) => void;
}

// Función para formatear la duración.
function formatearDuracion(minutos: number) {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  if (horas === 0) {
    return `${minutosRestantes} min`;
  }

  if (minutosRestantes === 0) {
    return `${horas} ${horas === 1 ? "hora" : "horas"}`;
  }

  return `${horas} h ${minutosRestantes} min`;
}

// Componente para controlar la duración.
function ControlDuracionReserva({
  duracionMinutos,
  minimoMinutos,
  maximoMinutos,
  incrementoMinutos,
  onCambiar,
}: ControlDuracionReservaProps) {
  // Comprueba si se puede reducir.
  const puedeReducir = duracionMinutos > minimoMinutos;

  // Comprueba si se puede aumentar.
  const puedeAumentar = duracionMinutos < maximoMinutos;

  // Función para reducir la duración.
  const reducirDuracion = () => {
    if (!puedeReducir) {
      return;
    }

    onCambiar(duracionMinutos - incrementoMinutos);
  };

  // Función para aumentar la duración.
  const aumentarDuracion = () => {
    if (!puedeAumentar) {
      return;
    }

    onCambiar(duracionMinutos + incrementoMinutos);
  };

  return (
    <div className="reserva-toma__duracion-control">
      {/* Botón para reducir la duración. */}
      <button
        type="button"
        aria-label={`Reducir duración en ${incrementoMinutos} minutos`}
        disabled={!puedeReducir}
        onClick={reducirDuracion}
      >
        −
      </button>

      {/* Duración seleccionada. */}
      <div aria-live="polite">
        <strong>{formatearDuracion(duracionMinutos)}</strong>
        <span>Bloques de {incrementoMinutos} minutos</span>
      </div>

      {/* Botón para aumentar la duración. */}
      <button
        type="button"
        aria-label={`Aumentar duración en ${incrementoMinutos} minutos`}
        disabled={!puedeAumentar}
        onClick={aumentarDuracion}
      >
        +
      </button>
    </div>
  );
}

export default ControlDuracionReserva;
export { formatearDuracion };
