import type { ChangeEvent } from "react";

import type {
  DatosUsuarioRegistro,
  ErroresRegistro,
} from "../../types/registro";

import CampoSelect from "./CampoSelect";
import CampoTexto from "./CampoTexto";

interface FormularioUsuarioProps {
  prefijo: "principal" | "segundo";
  claveErrores: "usuarioPrincipal" | "segundoConductor";
  usuario: DatosUsuarioRegistro;
  errores: ErroresRegistro;
  onChange: (evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function FormularioUsuario({
  prefijo,
  claveErrores,
  usuario,
  errores,
  onChange,
}: FormularioUsuarioProps) {
  return (
    <div className="registro__grid">
      <CampoTexto
        id={`${prefijo}-nombre`}
        nombre="nombre"
        etiqueta="Nombre"
        valor={usuario.nombre}
        autoComplete="given-name"
        error={errores[`${claveErrores}.nombre`]}
        onChange={onChange}
      />

      <CampoTexto
        id={`${prefijo}-apellidos`}
        nombre="apellidos"
        etiqueta="Apellidos"
        valor={usuario.apellidos}
        autoComplete="family-name"
        error={errores[`${claveErrores}.apellidos`]}
        onChange={onChange}
      />

      <div className="registro__completo">
        <CampoTexto
          id={`${prefijo}-email`}
          nombre="email"
          etiqueta="Email"
          tipo="email"
          valor={usuario.email}
          placeholder="usuario@email.com"
          ayuda="Recibirás los avisos de la solicitud en este email."
          autoComplete="email"
          error={errores[`${claveErrores}.email`]}
          onChange={onChange}
        />
      </div>

      <CampoTexto
        id={`${prefijo}-contrasena`}
        nombre="contrasena"
        etiqueta="Contraseña"
        tipo="password"
        valor={usuario.contrasena}
        ayuda="Mínimo 8 caracteres."
        autoComplete="new-password"
        error={errores[`${claveErrores}.contrasena`]}
        onChange={onChange}
      />

      <CampoTexto
        id={`${prefijo}-repetir-contrasena`}
        nombre="repetirContrasena"
        etiqueta="Repetir contraseña"
        tipo="password"
        valor={usuario.repetirContrasena}
        autoComplete="new-password"
        error={errores[`${claveErrores}.repetirContrasena`]}
        onChange={onChange}
      />

      <CampoTexto
        id={`${prefijo}-dni`}
        nombre="dni"
        etiqueta="DNI / NIE"
        valor={usuario.dni}
        placeholder="12345678A"
        error={errores[`${claveErrores}.dni`]}
        onChange={onChange}
      />

      <CampoTexto
        id={`${prefijo}-telefono`}
        nombre="telefono"
        etiqueta="Teléfono móvil"
        tipo="tel"
        valor={usuario.telefono}
        placeholder="600000000"
        autoComplete="tel"
        error={errores[`${claveErrores}.telefono`]}
        onChange={onChange}
      />

      <div className="registro__completo">
        <CampoSelect
          id={`${prefijo}-filiacion`}
          nombre="filiacion"
          etiqueta="Filiación con el Ayuntamiento"
          valor={usuario.filiacion}
          error={errores[`${claveErrores}.filiacion`]}
          onChange={onChange}
          opciones={[
            {
              valor: "residente",
              texto: "Residente en Quer",
            },
            {
              valor: "trabajador",
              texto: "Trabajador/a en Quer",
            },
            {
              valor: "actividad",
              texto: "Inscrito/a en actividad en Quer",
            },
          ]}
        />
      </div>
    </div>
  );
}

export default FormularioUsuario;
