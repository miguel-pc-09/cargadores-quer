import "../../styles/Ayuda/AyudaPage.css";

function AyudaPage() {
  return (
    <section className="ayuda">
      <header className="ayuda__cabecera">
        <h1>Ayuda</h1>

        <p>
          Consulta las preguntas más frecuentes sobre reservas, cargas y
          funcionamiento de los cargadores.
        </p>
      </header>

      <div className="ayuda__contenido">
        {/* RESERVAS */}

        <section className="ayuda__seccion">
          <header className="ayuda__seccion-cabecera">
            <span className="ayuda__seccion-icono" aria-hidden="true">
              ◫
            </span>

            <div>
              <span className="ayuda__etiqueta">Reservas</span>

              <h2>Reservar una toma</h2>
            </div>
          </header>

          <div className="ayuda__preguntas">
            <details className="ayuda__pregunta">
              <summary>
                <span>¿Cómo puedo reservar una toma?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Entra en <strong>Cargadores</strong>, selecciona el punto de
                  carga que quieras utilizar y pulsa sobre una de sus tomas.
                </p>

                <p>
                  Después podrás elegir el día, la hora de inicio y la duración
                  de la reserva antes de confirmarla.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>¿Con cuánta antelación puedo reservar?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Puedes realizar reservas para el día actual y los dos días
                  siguientes.
                </p>

                <p>
                  Los horarios se muestran en intervalos de 30 minutos desde las
                  00:00 hasta las 23:30.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>¿Cuánto tiempo puedo reservar?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Cada reserva puede tener una duración máxima de
                  <strong> 4 horas</strong>, seleccionadas en bloques de 30
                  minutos.
                </p>

                <p>
                  Si existe otra reserva después de la tuya, la aplicación
                  limitará automáticamente la duración para evitar que ambas
                  reservas coincidan.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>
                  ¿Puedo reservar si la carga termina al día siguiente?
                </span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Sí. Si, por ejemplo, comienzas una reserva a las 23:00 y
                  seleccionas varias horas, la reserva puede continuar
                  automáticamente durante el día siguiente.
                </p>

                <p>
                  Esas horas aparecerán también como ocupadas en el horario del
                  día siguiente.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>¿Cómo cancelo una reserva?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Entra en <strong>Mis reservas</strong> y busca la reserva que
                  quieras cancelar.
                </p>

                <p>
                  Las reservas futuras pueden cancelarse antes de que comience
                  su horario sin generar una penalización.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* CARGA */}

        <section className="ayuda__seccion">
          <header className="ayuda__seccion-cabecera">
            <span className="ayuda__seccion-icono" aria-hidden="true">
              ⚡
            </span>

            <div>
              <span className="ayuda__etiqueta">Carga</span>

              <h2>Utilizar el cargador</h2>
            </div>
          </header>

          <div className="ayuda__preguntas">
            <details className="ayuda__pregunta">
              <summary>
                <span>¿Cuándo puedo iniciar mi carga?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Cuando llegue el horario de tu reserva, entra en el cargador
                  correspondiente.
                </p>

                <p>
                  El botón <strong>Iniciar carga</strong> se habilitará cuando
                  puedas comenzar.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>¿Qué información puedo ver durante una carga?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Durante la carga podrás consultar datos como la potencia
                  actual, la energía suministrada, la duración y el progreso de
                  la sesión.
                </p>

                <p>
                  También podrás detener la carga desde la propia aplicación
                  cuando sea necesario.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>¿Dónde puedo consultar mis cargas anteriores?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  En <strong>Mis cargas</strong> puedes consultar todas tus
                  sesiones anteriores.
                </p>

                <p>
                  Allí encontrarás la fecha, cargador, duración y energía
                  suministrada, además del resumen total de consumo.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>
                  ¿Puedo iniciar una carga si he cambiado de vehículo?
                </span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Si has solicitado un cambio de vehículo, los nuevos datos
                  deberán ser validados antes de poder iniciar nuevas cargas.
                </p>

                <p>
                  Puedes consultar el estado de la validación desde la sección{" "}
                  <strong>Perfil</strong>.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* FINALIZACIÓN Y CORTESÍA */}

        <section className="ayuda__seccion">
          <header className="ayuda__seccion-cabecera">
            <span className="ayuda__seccion-icono" aria-hidden="true">
              ◷
            </span>

            <div>
              <span className="ayuda__etiqueta">Finalización</span>

              <h2>Retirada del vehículo</h2>
            </div>
          </header>

          <div className="ayuda__preguntas">
            <details className="ayuda__pregunta">
              <summary>
                <span>¿Qué ocurre cuando termina mi tiempo de carga?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Cuando finalice tu periodo de carga deberás retirar el
                  vehículo para dejar libre la toma al siguiente usuario.
                </p>

                <p>
                  Dispondrás de un periodo de cortesía de
                  <strong> 15 minutos</strong> para hacerlo.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>¿Qué ocurre si no retiro el vehículo a tiempo?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Si el vehículo continúa ocupando la plaza después del periodo
                  de cortesía, podrá registrarse una incidencia.
                </p>

                <p>
                  Las reglas concretas de penalización dependerán de las
                  condiciones establecidas por el Ayuntamiento.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>
                  ¿Qué ocurre si el usuario anterior no ha retirado su coche?
                </span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Si no puedes utilizar tu reserva porque el usuario anterior
                  sigue ocupando la toma, no se considerará responsabilidad
                  tuya.
                </p>

                <p>
                  La aplicación podrá permitirte buscar otra toma disponible y
                  la incidencia quedará asociada al usuario que no retiró su
                  vehículo.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* NOTIFICACIONES */}

        <section className="ayuda__seccion">
          <header className="ayuda__seccion-cabecera">
            <span className="ayuda__seccion-icono" aria-hidden="true">
              !
            </span>

            <div>
              <span className="ayuda__etiqueta">Avisos</span>

              <h2>Notificaciones</h2>
            </div>
          </header>

          <div className="ayuda__preguntas">
            <details className="ayuda__pregunta">
              <summary>
                <span>¿Recibiré un aviso antes de mi reserva?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  La aplicación está preparada para avisarte cuando falten
                  aproximadamente
                  <strong> 15 minutos</strong> para el comienzo de tu reserva.
                </p>

                <p>
                  Estos avisos podrán recibirse tanto dentro de la aplicación
                  como por correo electrónico.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>¿Puedo desactivar algunos avisos?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Sí. Desde <strong>Perfil</strong> podrás gestionar las
                  preferencias de notificaciones de la aplicación y del correo
                  electrónico.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* CUENTA */}

        <section className="ayuda__seccion">
          <header className="ayuda__seccion-cabecera">
            <span className="ayuda__seccion-icono" aria-hidden="true">
              ♙
            </span>

            <div>
              <span className="ayuda__etiqueta">Cuenta</span>

              <h2>Perfil y vehículo</h2>
            </div>
          </header>

          <div className="ayuda__preguntas">
            <details className="ayuda__pregunta">
              <summary>
                <span>¿Cómo modifico los datos de mi vehículo?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Entra en <strong>Perfil</strong> y pulsa
                  <strong> Editar vehículo</strong>.
                </p>

                <p>
                  Puedes modificar la marca o modelo, la matrícula y el tipo de
                  vehículo.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>¿Por qué debe validarse un cambio de vehículo?</span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  La validación permite comprobar que el vehículo pertenece
                  realmente al usuario autorizado para utilizar el servicio.
                </p>

                <p>
                  De esta forma se evita que una cuenta pueda cambiar
                  continuamente de matrícula para permitir el uso de los
                  cargadores a vehículos no autorizados.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* ACCESO DESDE EL MÓVIL */}

        <section className="ayuda__seccion">
          <header className="ayuda__seccion-cabecera">
            <span className="ayuda__seccion-icono" aria-hidden="true">
              ◉
            </span>

            <div>
              <span className="ayuda__etiqueta">Acceso rápido</span>

              <h2>Añadir CargaQuer al móvil</h2>
            </div>
          </header>

          <div className="ayuda__preguntas">
            <details className="ayuda__pregunta">
              <summary>
                <span>
                  ¿Cómo puedo añadir CargaQuer a la pantalla de inicio en
                  Android?
                </span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Abre CargaQuer desde <strong>Google Chrome</strong> en tu
                  teléfono Android.
                </p>

                <p>
                  Pulsa el menú de los <strong>tres puntos</strong> situado en
                  la parte superior derecha del navegador.
                </p>

                <p>
                  Selecciona <strong>Añadir a pantalla de inicio</strong> o
                  <strong> Instalar aplicación</strong>, dependiendo de la
                  versión de Chrome que tengas instalada.
                </p>

                <p>
                  Confirma la operación y aparecerá un icono de CargaQuer en la
                  pantalla de inicio de tu teléfono. A partir de ese momento
                  podrás abrir el servicio directamente desde ese icono.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>
                  ¿Cómo puedo añadir CargaQuer a la pantalla de inicio en
                  iPhone?
                </span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  Abre CargaQuer desde <strong>Safari</strong> en tu iPhone.
                </p>

                <p>
                  Pulsa el botón <strong>Compartir</strong> del navegador.
                </p>

                <p>
                  Busca la opción <strong>Añadir a pantalla de inicio</strong> y
                  selecciónala.
                </p>

                <p>
                  Confirma el nombre y pulsa <strong>Añadir</strong>. Se creará
                  un icono de CargaQuer en la pantalla de inicio y podrás entrar
                  al servicio directamente desde él.
                </p>
              </div>
            </details>

            <details className="ayuda__pregunta">
              <summary>
                <span>
                  ¿Es una aplicación instalada desde App Store o Google Play?
                </span>

                <span className="ayuda__flecha" aria-hidden="true">
                  +
                </span>
              </summary>

              <div className="ayuda__respuesta">
                <p>
                  No. CargaQuer es una <strong>aplicación web</strong> que se
                  utiliza desde el navegador.
                </p>

                <p>
                  Al añadirla a la pantalla de inicio se crea un acceso directo
                  que permite abrirla desde un icono de forma similar a una
                  aplicación instalada.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* CONTACTO */}

        <section className="ayuda__contacto">
          <div className="ayuda__contacto-icono" aria-hidden="true">
            ?
          </div>

          <div className="ayuda__contacto-contenido">
            <span className="ayuda__etiqueta">¿Sigues necesitando ayuda?</span>

            <h2>Contacta con el Ayuntamiento</h2>

            <p>
              Si tienes una incidencia con un cargador o necesitas ayuda con tu
              cuenta, podrás contactar con el Ayuntamiento de Quer.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}

export default AyudaPage;
