interface ControlDuracionReservaProps {
  duracionMinutos: number;
  minimoMinutos: number;
  maximoMinutos: number;
  incrementoMinutos: number;
  onCambiar: (duracion: number) => void;
}

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

function ControlDuracionReserva({
  duracionMinutos,
  minimoMinutos,
  maximoMinutos,
  incrementoMinutos,
  onCambiar,
}: ControlDuracionReservaProps) {
  const puedeReducir = duracionMinutos > minimoMinutos;
  const puedeAumentar = duracionMinutos < maximoMinutos;

  const reducirDuracion = () => {
    if (!puedeReducir) {
      return;
    }

    onCambiar(duracionMinutos - incrementoMinutos);
  };

  const aumentarDuracion = () => {
    if (!puedeAumentar) {
      return;
    }

    onCambiar(duracionMinutos + incrementoMinutos);
  };

  return (
    <div className="reserva-toma__duracion-control">
      <button
        type="button"
        aria-label={`Reducir duración en ${incrementoMinutos} minutos`}
        disabled={!puedeReducir}
        onClick={reducirDuracion}
      >
        −
      </button>

      <div aria-live="polite">
        <strong>{formatearDuracion(duracionMinutos)}</strong>
        <span>Bloques de {incrementoMinutos} minutos</span>
      </div>

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
