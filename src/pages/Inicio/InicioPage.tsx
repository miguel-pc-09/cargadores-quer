import ActividadReciente from "../../components/panelUsuario/ActividadReciente";
import AlertaUsuario from "../../components/panelUsuario/AlertaUsuario";
import TarjetaEstado from "../../components/panelUsuario/TarjetaEstado";
import TarjetaResumen from "../../components/panelUsuario/TarjetaResumen";

import {
  actividadUsuarioSimulada,
  alertasUsuarioSimuladas,
  nombreUsuarioSimulado,
  resumenUsuarioSimulado,
} from "../../data/panelUsuario";

import "../../styles/PanelUsuario/InicioPage.css";

function InicioPage() {
  const resumen = resumenUsuarioSimulado;

  return (
    <section className="inicio-panel">
      <header className="inicio-panel__cabecera">
        <span className="inicio-panel__etiqueta">Panel de usuario</span>

        <h1>¡Hola, {nombreUsuarioSimulado}!</h1>

        <p>
          Consulta rápidamente el estado de tu cuenta, tus reservas y tu
          actividad reciente.
        </p>
      </header>

      {alertasUsuarioSimuladas.length > 0 && (
        <section
          className="inicio-panel__alertas"
          aria-label="Avisos del usuario"
        >
          {alertasUsuarioSimuladas.map((alerta) => (
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
          detalle={`${resumen.energiaAcumulada.toLocaleString("es-ES")} kWh acumulados`}
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

      <ActividadReciente actividades={actividadUsuarioSimulada} />
    </section>
  );
}

export default InicioPage;
