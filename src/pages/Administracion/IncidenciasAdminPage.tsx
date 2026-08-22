import { useCallback, useEffect, useState } from "react";

import {
  obtenerIncidenciasAdministracion,
  type IncidenciaAdministracion,
} from "../../services/adminService";

import "../../styles/Administracion/IncidenciasAdminPage.css";

interface ContactoEmpresa {
  nombre: string;
  telefono: string;
  correo: string;
}

// Datos de contacto para la demostración.
const CONTACTO_SUMINISTRADORA_DEMO: ContactoEmpresa = {
  nombre: "Iberdrola",
  telefono: "900 000 101",
  correo: "suministro@demo.cargaquer.es",
};

const CONTACTO_INSTALADORA_DEMO: ContactoEmpresa = {
  nombre: "Elecnor",
  telefono: "900 000 202",
  correo: "instalacion@demo.cargaquer.es",
};

// Comprueba si falta un dato.
const datoVacio = (valor: string) => {
  const dato = valor.trim();

  return !dato || dato === "—";
};

// Prepara los datos de contacto de una incidencia.
const obtenerContactos = (incidencia: IncidenciaAdministracion) => {
  const suministradora: ContactoEmpresa = {
    nombre: datoVacio(incidencia.empresaSuministradora)
      ? CONTACTO_SUMINISTRADORA_DEMO.nombre
      : incidencia.empresaSuministradora,
    telefono: datoVacio(incidencia.telefonoSuministradora)
      ? CONTACTO_SUMINISTRADORA_DEMO.telefono
      : incidencia.telefonoSuministradora,
    correo: CONTACTO_SUMINISTRADORA_DEMO.correo,
  };

  const instaladora: ContactoEmpresa = {
    nombre: datoVacio(incidencia.empresaInstaladora)
      ? CONTACTO_INSTALADORA_DEMO.nombre
      : incidencia.empresaInstaladora,
    telefono: datoVacio(incidencia.telefonoInstaladora)
      ? CONTACTO_INSTALADORA_DEMO.telefono
      : incidencia.telefonoInstaladora,
    correo: CONTACTO_INSTALADORA_DEMO.correo,
  };

  return {
    suministradora,
    instaladora,
  };
};

function IncidenciasAdminPage() {
  const [incidencias, setIncidencias] = useState<IncidenciaAdministracion[]>(
    [],
  );

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const cargarIncidencias = useCallback(async () => {
    try {
      setCargando(true);

      setError("");

      const resultado = await obtenerIncidenciasAdministracion();

      setIncidencias(resultado);
    } catch (errorCarga) {
      setError(
        errorCarga instanceof Error
          ? errorCarga.message
          : "No se han podido cargar las incidencias.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarIncidencias();
  }, [cargarIncidencias]);

  return (
    <section className="incidencias-admin">
      <header className="incidencias-admin__cabecera">
        <span className="incidencias-admin__etiqueta">Panel municipal</span>

        <h1>Incidencias</h1>

        <p>Consulta los cargadores que tienen incidencias pendientes.</p>
      </header>

      {error && (
        <div className="incidencias-admin__error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{error}</p>
        </div>
      )}

      {cargando ? (
        <div className="incidencias-admin__cargando">
          <span className="incidencias-admin__spinner" />

          <p>Cargando incidencias...</p>
        </div>
      ) : incidencias.length === 0 ? (
        <div className="incidencias-admin__vacio">
          <span aria-hidden="true">✓</span>

          <h2>No hay incidencias abiertas</h2>

          <p>Todos los cargadores se encuentran sin incidencias pendientes.</p>
        </div>
      ) : (
        <div className="incidencias-admin__lista">
          {incidencias.map((incidencia) => {
            const contactos = obtenerContactos(incidencia);

            return (
              <article
                key={incidencia.id}
                className="incidencias-admin__tarjeta"
              >
                <header className="incidencias-admin__tarjeta-cabecera">
                  <div>
                    <span className="incidencias-admin__tipo">
                      {incidencia.tipo}
                    </span>

                    <h2>{incidencia.cargadorNombre}</h2>

                    <p>{incidencia.tomaNombre}</p>
                  </div>

                  <span className="incidencias-admin__estado">
                    {incidencia.estado}
                  </span>
                </header>

                <div className="incidencias-admin__descripcion">
                  <strong>Incidencia</strong>

                  <p>{incidencia.descripcion}</p>
                </div>

                <div className="incidencias-admin__empresas">
                  <section className="incidencias-admin__empresa">
                    <span>Empresa suministradora</span>

                    <strong>{contactos.suministradora.nombre}</strong>

                    <div className="incidencias-admin__contacto">
                      <p>
                        <b>Teléfono:</b> {contactos.suministradora.telefono}
                      </p>

                      <p>
                        <b>Correo:</b> {contactos.suministradora.correo}
                      </p>
                    </div>
                  </section>

                  <section className="incidencias-admin__empresa">
                    <span>Empresa instaladora</span>

                    <strong>{contactos.instaladora.nombre}</strong>

                    <div className="incidencias-admin__contacto">
                      <p>
                        <b>Teléfono:</b> {contactos.instaladora.telefono}
                      </p>

                      <p>
                        <b>Correo:</b> {contactos.instaladora.correo}
                      </p>
                    </div>
                  </section>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default IncidenciasAdminPage;
