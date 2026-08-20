import type { EstadoCargador } from "../../types/charger";

// Propiedades del estado del cargador.
interface EstadoConexionCargadorProps {
  estado: EstadoCargador;
  fabricante?: string;
  gestor?: string;
}

// Contenido de cada estado.
const contenidoEstado = {
  conectado: {
    titulo: "Cargador conectado",
    descripcion: "El cargador está operativo y disponible para su uso.",
    icono: "●",
  },
  desconectado: {
    titulo: "Cargador desconectado",
    descripcion:
      "El cargador no está comunicando con el sistema en este momento.",
    icono: "×",
  },
  mantenimiento: {
    titulo: "Cargador en mantenimiento",
    descripcion:
      "El cargador está siendo revisado y puede no estar disponible.",
    icono: "!",
  },
};

// Componente para mostrar el estado del cargador.
function EstadoConexionCargador({
  estado,
  fabricante,
  gestor,
}: EstadoConexionCargadorProps) {
  const contenido = contenidoEstado[estado];

  // Comprueba si hay datos adicionales.
  const mostrarDatos = Boolean(fabricante?.trim()) || Boolean(gestor?.trim());

  return (
    <article
      className={`estado-conexion estado-conexion--${estado}`}
      aria-label={contenido.titulo}
    >
      <div className="estado-conexion__cabecera">
        <span className="estado-conexion__icono" aria-hidden="true">
          {contenido.icono}
        </span>

        <div>
          <h2>{contenido.titulo}</h2>

          <p>{contenido.descripcion}</p>
        </div>
      </div>

      {/* Fabricante y gestor del cargador. */}
      {mostrarDatos && (
        <div className="estado-conexion__datos">
          {fabricante && <span>{fabricante}</span>}

          {fabricante && gestor && <span>·</span>}

          {gestor && <span>{gestor}</span>}
        </div>
      )}
    </article>
  );
}

export default EstadoConexionCargador;
