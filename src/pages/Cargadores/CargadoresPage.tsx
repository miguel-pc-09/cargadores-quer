import { useEffect, useMemo, useState } from "react";

import TarjetaCargador from "../../components/cargadores/TarjetaCargador";
import AlertaUsuario from "../../components/panelUsuario/AlertaUsuario";

import useAuth from "../../hooks/useAuth";

import { obtenerCargadores } from "../../services/chargersService";
import { obtenerPanelUsuario } from "../../services/panelUsuarioService";

import type { Cargador } from "../../types/charger";
import type { AlertaUsuario as AlertaUsuarioTipo } from "../../types/panelUsuario";

import "../../styles/Cargadores/CargadoresPage.css";

function CargadoresPage() {
  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  const [cargadores, setCargadores] = useState<Cargador[]>([]);

  const [alertas, setAlertas] = useState<AlertaUsuarioTipo[]>([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        setCargando(true);

        setError("");

        const promesaCargadores = obtenerCargadores();

        const promesaPanel = usuarioId
          ? obtenerPanelUsuario(usuarioId)
          : Promise.resolve(null);

        const [cargadoresObtenidos, panel] = await Promise.all([
          promesaCargadores,
          promesaPanel,
        ]);

        if (!activo) {
          return;
        }

        setCargadores(cargadoresObtenidos);

        setAlertas(panel?.alertas ?? []);
      } catch (errorCarga) {
        if (!activo) {
          return;
        }

        setCargadores([]);

        setAlertas([]);

        setError(
          errorCarga instanceof Error
            ? errorCarga.message
            : "No se han podido cargar los cargadores.",
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, [usuarioId]);

  const numeroTomas = useMemo(
    () =>
      cargadores.reduce((total, cargador) => total + cargador.tomas.length, 0),
    [cargadores],
  );

  const numeroTomasLibres = useMemo(
    () =>
      cargadores.reduce(
        (total, cargador) =>
          total +
          cargador.tomas.filter((toma) => toma.estado === "libre").length,
        0,
      ),
    [cargadores],
  );

  return (
    <section className="cargadores-page">
      <header className="cargadores-page__cabecera">
        <div>
          <span className="cargadores-page__etiqueta">Red municipal</span>

          <h1>Cargadores</h1>

          <p>
            Consulta el estado de los puntos de carga y selecciona una ubicación
            para reservar una toma.
          </p>
        </div>

        <div className="cargadores-page__estadisticas">
          <div>
            <strong>{cargadores.length}</strong>

            <span>ubicaciones</span>
          </div>

          <div>
            <strong>{numeroTomas}</strong>

            <span>tomas</span>
          </div>

          <div>
            <strong>{numeroTomasLibres}</strong>

            <span>libres ahora</span>
          </div>
        </div>
      </header>

      {alertas.length > 0 && (
        <section
          className="cargadores-page__alertas"
          aria-label="Avisos del usuario"
        >
          {alertas.map((alerta) => (
            <AlertaUsuario key={alerta.id} alerta={alerta} />
          ))}
        </section>
      )}

      {error && (
        <p
          role="alert"
          style={{
            margin: "0 0 18px",
            color: "var(--color-error)",
          }}
        >
          {error}
        </p>
      )}

      {cargando ? (
        <p
          style={{
            color: "var(--color-texto-suave)",
          }}
        >
          Cargando cargadores...
        </p>
      ) : (
        <section
          className="cargadores-page__listado"
          aria-label="Listado de cargadores"
        >
          {cargadores.length === 0 ? (
            <p
              style={{
                color: "var(--color-texto-suave)",
              }}
            >
              No hay cargadores disponibles.
            </p>
          ) : (
            cargadores.map((cargador) => (
              <TarjetaCargador key={cargador.id} cargador={cargador} />
            ))
          )}
        </section>
      )}
    </section>
  );
}

export default CargadoresPage;
