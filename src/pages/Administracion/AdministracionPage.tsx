import "../../styles/Administracion/AdministracionPage.css";

function AdministracionPage() {
  return (
    <section className="administracion">
      <header className="administracion__cabecera">
        <span className="administracion__etiqueta">Panel municipal</span>

        <h1>Resumen</h1>

        <p>
          Consulta el estado general del servicio de recarga eléctrica de Quer.
        </p>
      </header>

      <section className="administracion__metricas">
        <article className="administracion__metrica">
          <span>Usuarios registrados</span>

          <strong>24</strong>

          <small>21 usuarios activos</small>
        </article>

        <article className="administracion__metrica">
          <span>Cargas realizadas</span>

          <strong>186</strong>

          <small>Total acumulado</small>
        </article>

        <article className="administracion__metrica">
          <span>Energía suministrada</span>

          <strong>1.284 kWh</strong>

          <small>Total acumulado</small>
        </article>

        <article className="administracion__metrica administracion__metrica--pendiente">
          <span>Validaciones pendientes</span>

          <strong>2</strong>

          <small>Cambios de vehículo</small>
        </article>

        <article className="administracion__metrica administracion__metrica--incidencia">
          <span>Incidencias abiertas</span>

          <strong>3</strong>

          <small>Requieren revisión</small>
        </article>

        <article className="administracion__metrica">
          <span>Cargadores</span>

          <strong>4</strong>

          <small>7 tomas instaladas</small>
        </article>
      </section>

      <section className="administracion__panel">
        <header className="administracion__panel-cabecera">
          <div>
            <span className="administracion__etiqueta">Actividad</span>

            <h2>Últimos movimientos</h2>
          </div>
        </header>

        <div className="administracion__tabla-contenedor">
          <table className="administracion__tabla">
            <thead>
              <tr>
                <th>Fecha</th>

                <th>Usuario</th>

                <th>Acción</th>

                <th>Cargador</th>

                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>08/08/2026, 09:12</td>

                <td>Miguel Ángel</td>

                <td>Carga finalizada</td>

                <td>Enebros</td>

                <td>
                  <span className="administracion__estado administracion__estado--correcto">
                    Correcto
                  </span>
                </td>
              </tr>

              <tr>
                <td>08/08/2026, 08:47</td>

                <td>Usuario demo</td>

                <td>Cambio de vehículo</td>

                <td>—</td>

                <td>
                  <span className="administracion__estado administracion__estado--pendiente">
                    Pendiente
                  </span>
                </td>
              </tr>

              <tr>
                <td>07/08/2026, 21:30</td>

                <td>Usuario demo 2</td>

                <td>Incidencia registrada</td>

                <td>Centro Cultural</td>

                <td>
                  <span className="administracion__estado administracion__estado--incidencia">
                    Revisar
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default AdministracionPage;
