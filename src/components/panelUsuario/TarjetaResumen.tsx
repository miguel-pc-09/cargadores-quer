import { Link } from "react-router-dom";

interface TarjetaResumenProps {
  icono: string;
  valor: string | number;
  titulo: string;
  detalle: string;
  ruta: string;
  variante?: "principal" | "verde" | "ambar";
}

function TarjetaResumen({
  icono,
  valor,
  titulo,
  detalle,
  ruta,
  variante = "principal",
}: TarjetaResumenProps) {
  return (
    <Link to={ruta} className={`tarjeta-resumen tarjeta-resumen--${variante}`}>
      <div className="tarjeta-resumen__cabecera">
        <span className="tarjeta-resumen__icono" aria-hidden="true">
          {icono}
        </span>

        <span className="tarjeta-resumen__flecha" aria-hidden="true">
          →
        </span>
      </div>

      <strong className="tarjeta-resumen__valor">{valor}</strong>

      <span className="tarjeta-resumen__titulo">{titulo}</span>

      <span className="tarjeta-resumen__detalle">{detalle}</span>
    </Link>
  );
}

export default TarjetaResumen;
