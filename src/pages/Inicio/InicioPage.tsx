import { useEffect, useState } from "react";

import ActividadReciente from "../../components/panelUsuario/ActividadReciente";
import AlertaUsuario from "../../components/panelUsuario/AlertaUsuario";
import TarjetaEstado from "../../components/panelUsuario/TarjetaEstado";
import TarjetaResumen from "../../components/panelUsuario/TarjetaResumen";

import useAuth from "../../hooks/useAuth";

import { obtenerPanelUsuario } from "../../services/panelUsuarioService";

import type {
  ActividadUsuario,
  AlertaUsuario as AlertaUsuarioTipo,
  ResumenUsuario,
} from "../../types/panelUsuario";

import "../../styles/PanelUsuario/InicioPage.css";

const RESUMEN_VACIO: ResumenUsuario = {
  numeroCargadores: 0,
  numeroTomas: 0,
  numeroCargas: 0,
  energiaAcumulada: 0,
  reservasActivas: 0,
  proximaReserva: undefined,
  estado: "correcto",
  numeroPenalizaciones: 0,
};

function InicioPage() {
  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? "";

  const nombreUsuario = usuario?.nombre ?? "Usuario";

  const [resumen, setResumen] = useState<ResumenUsuario>(RESUMEN_VACIO);

  const [alertas, setAlertas] = useState<AlertaUsuarioTipo[]>([]);

  const [actividad, setActividad] = useState<ActividadUsuario[]>([]);

  const [cargando, setCargando] = useState(true);

  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    if (!usuarioId) {
      setCargando(false);

      return;
    }

    const cargarPanel = async () => {
      setCargando(true);

      setMensajeError("");

      try {
        const datos = await obtenerPanelUsuario(usuarioId);

        setResumen(datos.resumen);

        setAlertas(datos.alertas);

        setActividad(datos.actividad);
      } catch {
        setMensajeError("No hemos podido cargar el resumen de tu cuenta.");
      } finally {
        setCargando(false);
      }
    };

    void cargarPanel();
  }, [usuarioId]);

  return (
    <section className="inicio-panel">
      <header className="inicio-panel__cabecera">
        <span className="inicio-panel__etiqueta">Panel de usuario</span>

        <h1>¡Hola, {nombreUsuario}!</h1>

        <p>
          Consulta rápidamente el estado de tu cuenta, tus reservas y tu
          actividad reciente.
        </p>
      </header>

      {mensajeError && (
        <div className="inicio-panel__error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{mensajeError}</p>
        </div>
      )}

      {cargando ? (
        <div className="inicio-panel__cargando" role="status">
          <span className="inicio-panel__spinner" aria-hidden="true" />

          <p>Cargando resumen...</p>
        </div>
      ) : (
        <>
          {alertas.length > 0 && (
            <section
              className="inicio-panel__alertas"
              aria-label="Avisos del usuario"
            >
              {alertas.map((alerta) => (
                <AlertaUsuario key={alerta.id} alerta={alerta} />
              ))}
            </section>
          )}

          <section
            className="inicio-panel__resumen"
            aria-label="Resumen de la cuenta"
          >
            <TarjetaResumen
              icono="⚡"
              valor={resumen.numeroCargadores}
              titulo="Cargadores"
              detalle={`${resumen.numeroTomas} tomas disponibles en el municipio`}
              ruta="/panel/cargadores"
              variante="principal"
            />

            <TarjetaResumen
              icono="▤"
              valor={resumen.numeroCargas}
              titulo="Mis cargas"
              detalle={`${resumen.energiaAcumulada.toLocaleString(
                "es-ES",
              )} kWh acumulados`}
              ruta="/panel/mis-cargas"
              variante="verde"
            />

            <TarjetaResumen
              icono="▣"
              valor={resumen.reservasActivas}
              titulo={
                resumen.reservasActivas === 1
                  ? "Reserva activa"
                  : "Reservas activas"
              }
              detalle={
                resumen.proximaReserva
                  ? `Próxima: ${resumen.proximaReserva}`
                  : "No tienes reservas próximas"
              }
              ruta="/panel/mis-reservas"
              variante="ambar"
            />

            <TarjetaEstado
              estado={resumen.estado}
              numeroPenalizaciones={resumen.numeroPenalizaciones}
            />
          </section>

          <ActividadReciente actividades={actividad} />
        </>
      )}
    </section>
  );
}

export default InicioPage;
