import { Link } from "react-router-dom";

// Propiedades de la tarjeta de resumen.
interface TarjetaResumenProps {
  icono: string;
  valor: string | number;
  titulo: string;
  detalle: string;
  ruta: string;
  variante?: "principal" | "verde" | "ambar";
}

// Componente para mostrar una tarjeta de resumen.
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
      {/* Icono y acceso visual. */}
      <div className="tarjeta-resumen__cabecera">
        <span className="tarjeta-resumen__icono" aria-hidden="true">
          {icono}
        </span>

        <span className="tarjeta-resumen__flecha" aria-hidden="true">
          →
        </span>
      </div>

      {/* Información de la tarjeta. */}
      <strong className="tarjeta-resumen__valor">{valor}</strong>

      <span className="tarjeta-resumen__titulo">{titulo}</span>

      <span className="tarjeta-resumen__detalle">{detalle}</span>
    </Link>
  );
}

export default TarjetaResumen;
