import { Link, useParams } from "react-router-dom";

function ReservaTomaPage() {
  const { cargadorId, tomaId } = useParams();

  return (
    <section>
      <Link to={`/panel/cargadores/${cargadorId}`}>← Volver al cargador</Link>

      <h1>Reservar toma</h1>

      <p>Toma seleccionada: {tomaId}</p>

      <p>
        En el siguiente paso añadiremos el día, la hora de inicio y la duración
        en incrementos de 30 minutos.
      </p>
    </section>
  );
}

export default ReservaTomaPage;
