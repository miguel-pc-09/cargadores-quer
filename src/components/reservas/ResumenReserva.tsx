import { formatearDuracionReserva } from "../../utils/formateadores";

// Propiedades del resumen de la reserva.
interface ResumenReservaProps {
  nombreCargador: string;
  direccion: string;
  nombreToma: string;
  potenciaMaximaKw: number;
  fechaFormateada: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
}

// Componente para mostrar el resumen de la reserva.
function ResumenReserva({
  nombreCargador,
  direccion,
  nombreToma,
  potenciaMaximaKw,
  fechaFormateada,
  horaInicio,
  horaFin,
  duracionMinutos,
}: ResumenReservaProps) {
  return (
    <aside
      className="reserva-toma__resumen"
      aria-labelledby="titulo-resumen-reserva"
    >
      {/* Título del resumen. */}
      <span className="reserva-toma__etiqueta">Resumen</span>

      <h2 id="titulo-resumen-reserva">Tu reserva</h2>

      {/* Ubicación del cargador. */}
      <div className="reserva-toma__resumen-ubicacion">
        <span aria-hidden="true">⌁</span>

        <div>
          <strong>{nombreCargador}</strong>
          <p>{direccion}</p>
        </div>
      </div>

      {/* Datos de la reserva. */}
      <dl className="reserva-toma__resumen-datos">
        <div>
          <dt>Toma</dt>
          <dd>{nombreToma}</dd>
        </div>

        <div>
          <dt>Potencia máxima</dt>
          <dd>{potenciaMaximaKw.toLocaleString("es-ES")} kW</dd>
        </div>

        <div>
          <dt>Día</dt>
          <dd>{fechaFormateada}</dd>
        </div>

        <div>
          <dt>Horario</dt>
          <dd>
            {horaInicio} – {horaFin}
          </dd>
        </div>

        <div>
          <dt>Duración</dt>
          <dd>{formatearDuracionReserva(duracionMinutos)}</dd>
        </div>
      </dl>

      {/* Aviso para iniciar la carga. */}
      <p className="reserva-toma__aviso">
        Podrás iniciar la carga desde la aplicación cuando llegue la hora
        reservada.
      </p>
    </aside>
  );
}

export default ResumenReserva;
