import { useEffect, useState } from "react";

import AlertaUsuario from "../../components/panelUsuario/AlertaUsuario";
import TarjetaCargador from "../../components/cargadores/TarjetaCargador";

import { cargadoresSimulados } from "../../data/cargadores";

import useAuth from "../../hooks/useAuth";

import { obtenerPanelUsuario } from "../../services/panelUsuarioService";

import type { AlertaUsuario as AlertaUsuarioTipo } from "../../types/panelUsuario";

import "../../styles/Cargadores/CargadoresPage.css";

function CargadoresPage() {
  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  const [alertas, setAlertas] = useState<AlertaUsuarioTipo[]>([]);

  useEffect(() => {
    if (!usuarioId) {
      setAlertas([]);

      return;
    }

    const cargarAlertas = async () => {
      try {
        const panel = await obtenerPanelUsuario(usuarioId);

        setAlertas(panel.alertas);
      } catch {
        setAlertas([]);
      }
    };

    void cargarAlertas();
  }, [usuarioId]);

  const numeroTomas = cargadoresSimulados.reduce(
    (total, cargador) => total + cargador.tomas.length,
    0,
  );

  const numeroTomasLibres = cargadoresSimulados.reduce(
    (total, cargador) =>
      total + cargador.tomas.filter((toma) => toma.estado === "libre").length,
    0,
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
            <strong>{cargadoresSimulados.length}</strong>

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

      <section
        className="cargadores-page__listado"
        aria-label="Listado de cargadores"
      >
        {cargadoresSimulados.map((cargador) => (
          <TarjetaCargador key={cargador.id} cargador={cargador} />
        ))}
      </section>
    </section>
  );
}

export default CargadoresPage;
