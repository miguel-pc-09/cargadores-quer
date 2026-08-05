import { Link, useParams } from "react-router-dom";

function DetalleTomaPage() {
  const { cargadorId, tomaId } = useParams();

  return (
    <section>
      <Link to={`/panel/cargadores/${cargadorId}`}>← Volver al cargador</Link>

      <h1>Detalle de la toma</h1>

      <p>Toma seleccionada: {tomaId}</p>

      <p>
        Aquí mostraremos la reserva activa, la barra de tiempo y los datos de la
        carga.
      </p>
    </section>
  );
}

export default DetalleTomaPage;
