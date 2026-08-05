import type { AlertaUsuario as AlertaUsuarioTipo } from "../../types/panelUsuario";

interface AlertaUsuarioProps {
  alerta: AlertaUsuarioTipo;
}

const iconosAlerta = {
  informacion: "i",
  correcto: "✓",
  aviso: "!",
  error: "×",
};

function AlertaUsuario({ alerta }: AlertaUsuarioProps) {
  return (
    <article
      className={`alerta-usuario alerta-usuario--${alerta.tipo}`}
      role="status"
    >
      <span className="alerta-usuario__icono" aria-hidden="true">
        {iconosAlerta[alerta.tipo]}
      </span>

      <div className="alerta-usuario__contenido">
        <strong>{alerta.titulo}</strong>
        <p>{alerta.mensaje}</p>
      </div>
    </article>
  );
}

export default AlertaUsuario;
