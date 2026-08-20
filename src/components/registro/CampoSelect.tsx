import type { ChangeEvent } from "react";

import MensajeCampo from "./MensajeCampo";

// Estructura de cada opción.
interface OpcionSelect {
  valor: string;
  texto: string;
}

// Propiedades del campo select.
interface CampoSelectProps {
  id: string;
  nombre: string;
  etiqueta: string;
  valor: string;
  opciones: OpcionSelect[];
  textoInicial?: string;
  error?: string;
  onChange: (evento: ChangeEvent<HTMLSelectElement>) => void;
}

// Componente para mostrar un campo select.
function CampoSelect({
  id,
  nombre,
  etiqueta,
  valor,
  opciones,
  textoInicial = "— Selecciona una opción —",
  error,
  onChange,
}: CampoSelectProps) {
  return (
    <div className="registro__campo">
      <label htmlFor={id}>
        {etiqueta}
        <span aria-hidden="true">*</span>
      </label>

      {/* Selector de opciones. */}
      <select
        id={id}
        name={nombre}
        value={valor}
        className={`registro__control ${
          error ? "registro__control--error" : ""
        }`}
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

      {/* Mensaje de validación. */}
      <MensajeCampo error={error} />
    </div>
  );
}

export default CampoSelect;
