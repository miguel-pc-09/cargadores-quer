import type { ChangeEvent } from "react";

import MensajeCampo from "./MensajeCampo";

interface OpcionSelect {
  valor: string;
  texto: string;
}

interface CampoSelectProps {
  id: string;
  nombre: string;
  etiqueta: string;
  valor: string;
  opciones: OpcionSelect[];
  error?: string;
  textoInicial?: string;
  onChange: (evento: ChangeEvent<HTMLSelectElement>) => void;
}

function CampoSelect({
  id,
  nombre,
  etiqueta,
  valor,
  opciones,
  error,
  textoInicial = "— Selecciona —",
  onChange,
}: CampoSelectProps) {
  const claseControl = error
    ? "registro__control registro__control--error"
    : "registro__control";

  return (
    <div className="registro__campo">
      <label htmlFor={id}>
        {etiqueta}
        <span>*</span>
      </label>

      <select
        id={id}
        name={nombre}
        value={valor}
        className={claseControl}
        aria-invalid={Boolean(error)}
        onChange={onChange}
      >
        <option value="">{textoInicial}</option>

        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>

      <MensajeCampo error={error} />
    </div>
  );
}

export default CampoSelect;
