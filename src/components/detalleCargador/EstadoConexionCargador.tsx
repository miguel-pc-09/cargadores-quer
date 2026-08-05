import type { EstadoCargador } from "../../types/charger";

interface EstadoConexionCargadorProps {
  estado: EstadoCargador;
  fabricante: string;
  gestor: string;
}

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

function EstadoConexionCargador({
  estado,
  fabricante,
  gestor,
}: EstadoConexionCargadorProps) {
  const contenido = contenidoEstado[estado];

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

      <div className="estado-conexion__datos">
        <span>{fabricante}</span>
        <span>·</span>
        <span>{gestor}</span>
      </div>
    </article>
  );
}

export default EstadoConexionCargador;
