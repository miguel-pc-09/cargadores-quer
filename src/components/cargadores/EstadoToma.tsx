import type { EstadoToma as EstadoTomaTipo } from "../../types/charger";

interface EstadoTomaProps {
  estado: EstadoTomaTipo;
}

const contenidoEstado: Record<
  EstadoTomaTipo,
  {
    texto: string;
    icono: string;
  }
> = {
  libre: {
    texto: "Libre",
    icono: "✓",
  },
  ocupada: {
    texto: "En uso",
    icono: "●",
  },
  reservada: {
    texto: "Reservada",
    icono: "◷",
  },
  "fuera-servicio": {
    texto: "Fuera de servicio",
    icono: "!",
  },
  "mi-carga": {
    texto: "Tu carga",
    icono: "⚡",
  },
};

function EstadoToma({ estado }: EstadoTomaProps) {
  const contenido = contenidoEstado[estado];

  return (
    <span className={`estado-toma estado-toma--${estado}`}>
      <span className="estado-toma__icono" aria-hidden="true">
        {contenido.icono}
      </span>

      <span>{contenido.texto}</span>
    </span>
  );
}

export default EstadoToma;
