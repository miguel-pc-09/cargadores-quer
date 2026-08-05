import type { ChangeEvent, HTMLInputTypeAttribute } from "react";

import MensajeCampo from "./MensajeCampo";

interface CampoTextoProps {
  id: string;
  nombre: string;
  etiqueta: string;
  valor: string;
  tipo?: HTMLInputTypeAttribute;
  placeholder?: string;
  ayuda?: string;
  error?: string;
  autoComplete?: string;
  onChange: (evento: ChangeEvent<HTMLInputElement>) => void;
}

function CampoTexto({
  id,
  nombre,
  etiqueta,
  valor,
  tipo = "text",
  placeholder,
  ayuda,
  error,
  autoComplete,
  onChange,
}: CampoTextoProps) {
  const claseControl = error
    ? "registro__control registro__control--error"
    : "registro__control";

  return (
    <div className="registro__campo">
      <label htmlFor={id}>
        {etiqueta}
        <span>*</span>
      </label>

      <input
        id={id}
        name={nombre}
        type={tipo}
        value={valor}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={claseControl}
        aria-invalid={Boolean(error)}
        onChange={onChange}
      />

      <MensajeCampo error={error} ayuda={ayuda} />
    </div>
  );
}

export default CampoTexto;
