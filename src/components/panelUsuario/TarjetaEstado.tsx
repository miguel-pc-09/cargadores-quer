import type { EstadoUsuario } from "../../types/panelUsuario";

// Propiedades de la tarjeta de estado.
interface TarjetaEstadoProps {
  estado: EstadoUsuario;
  numeroPenalizaciones: number;
}

// Contenido para cada estado.
const contenidoEstado = {
  correcto: {
    icono: "✓",
    nombre: "Correcto",
    detalle: "Sin penalizaciones",
  },
  penalizado: {
    icono: "×",
    nombre: "Penalizado",
    detalle: "Penalización activa",
  },
  advertencia: {
    icono: "!",
    nombre: "Advertencia",
    detalle: "Revisa el estado de tu cuenta",
  },
};

// Componente para mostrar el estado de la cuenta.
function TarjetaEstado({ estado, numeroPenalizaciones }: TarjetaEstadoProps) {
  // Obtiene los datos del estado actual.
  const contenido = contenidoEstado[estado];

  // Calcula el texto de las penalizaciones.
  const detalle =
    estado === "penalizado"
      ? numeroPenalizaciones === 1
        ? "1 penalización activa"
        : `${numeroPenalizaciones} penalizaciones activas`
      : contenido.detalle;

  return (
    <article
      className={`tarjeta-estado tarjeta-estado--${estado}`}
      aria-label={`Estado del usuario: ${contenido.nombre}`}
    >
      <div className="tarjeta-estado__cabecera">
        <span className="tarjeta-estado__icono" aria-hidden="true">
          {contenido.icono}
        </span>

        <span className="tarjeta-estado__informativa">Informativo</span>
      </div>

      <strong className="tarjeta-estado__valor">{contenido.nombre}</strong>

      <span className="tarjeta-estado__titulo">Estado de la cuenta</span>

      <span className="tarjeta-estado__detalle">{detalle}</span>
    </article>
  );
}

export default TarjetaEstado;
