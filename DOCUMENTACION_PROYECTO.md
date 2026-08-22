# 📂 Estructura del proyecto

Este documento explica la función de cada carpeta y archivo principal de **CargaQuer**.
Su objetivo es facilitar la comprensión del proyecto a cualquier desarrollador que necesite revisarlo, mantenerlo o continuar su desarrollo.

---

# 📑 Índice

- [📁 public/](#-public)
- [📁 src/](#-src)
  - [components/](#-srccomponents)
  - [context/](#-srccontext)
  - [hooks/](#-srchooks)
  - [data/](#-srcdata)
  - [layouts/](#-srclayouts)
  - [pages/](#-srcpages)
  - [router/](#-srcrouter)
  - [services/](#-srcservices)
  - [types/](#-srctypes)
  - [utils/](#-srcutils)
  - [styles/](#-srcstyles)
- [📁 supabase/](#-supabase)
  - [Edge Functions](#-supabasefunctions)
  - [Migraciones](#-supabasemigrations)
- [📌 Tablas principales de Supabase](#-tablas-principales-de-supabase)
- [📌 Variables de entorno](#-variables-de-entorno)
- [📌 Organización de rutas](#-organización-de-rutas)
- [📌 Flujo de autenticación](#-flujo-de-autenticación)
- [📌 Flujo de registro](#-flujo-de-registro)
- [📌 Flujo de una reserva](#-flujo-de-una-reserva)
- [📌 Estados de reserva](#-estados-de-reserva)
- [📌 Flujo de carga](#-flujo-de-carga)
- [📌 Automatización de estados](#-automatización-de-estados)
- [📌 Datos DEMO](#-datos-demo)
- [📌 Separación general del proyecto](#-separación-general-del-proyecto)
- [📌 Archivos principales de la raíz](#-archivos-principales-de-la-raíz)

---

# 📁 public/

Contiene archivos estáticos que se copian directamente a la versión final de la aplicación.
No contiene lógica de React.

## `_redirects`

Configuración utilizada por Netlify para que las rutas internas de React Router funcionen correctamente al actualizar la página o acceder directamente a una URL.
Contenido:

```text
/* /index.html 200
```

Esto evita errores 404 en rutas como:

```text
/panel/cargadores
/panel/mis-reservas
/administracion/usuarios
```

## `favicon.svg`

Icono principal utilizado por el navegador.

## `icons.svg`

Archivo SVG con recursos gráficos utilizados por la aplicación.

---

# 📁 src/

Contiene todo el código fuente del frontend.
La mayor parte del desarrollo de CargaQuer se encuentra dentro de esta carpeta.
La estructura se divide en:

```text
src/
├── components/
├── context/
├── data/
├── hooks/
├── layouts/
├── pages/
├── router/
├── services/
├── styles/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

---

# 📁 src/components/

Contiene componentes reutilizables de React.
Los componentes se agrupan según la parte de la aplicación donde se utilizan.

---

# 📁 src/components/cargadores/

Componentes relacionados con la representación de cargadores y tomas.

## `TarjetaCargador.tsx`

Representa visualmente un cargador dentro del listado de cargadores.
Muestra la información principal del cargador y permite acceder a su detalle.

## `EstadoToma.tsx`

Representa visualmente el estado de una toma.
Se utiliza para mostrar de forma consistente si una toma está disponible, ocupada o en otro estado.

---

# 📁 src/components/detalleCargador/

Componentes utilizados dentro de la pantalla de detalle de un cargador.

## `TarjetaTomaDetalle.tsx`

Representa cada toma disponible dentro de un cargador.
Muestra información como:

- Nombre de la toma.
- Estado.
- Potencia.
- Disponibilidad.
- Acciones disponibles.

## `EstadoConexionCargador.tsx`

Muestra el estado general de conexión o disponibilidad del cargador.

---

# 📁 src/components/panelUsuario/

Componentes reutilizados dentro del panel privado del usuario.

## `BarraSuperior.tsx`

Barra superior del panel de usuario.
Gestiona elementos comunes como:

- Información de sesión.
- Tema visual.
- Acciones generales.

## `MenuLateral.tsx`

Menú lateral de navegación.
Permite acceder a:

- Inicio.
- Cargadores.
- Mis cargas.
- Mis reservas.
- Ayuda.
- Perfil.

## `TarjetaEstado.tsx`

Tarjeta utilizada para representar estados del usuario o del servicio.

## `ActividadReciente.tsx`

Muestra información sobre actividad reciente del usuario.

## `AlertaUsuario.tsx`

Representa avisos y alertas dentro del panel.

## `TarjetaResumen.tsx`

Tarjeta reutilizable utilizada para mostrar datos resumidos en la pantalla principal.

---

# 📁 src/components/registro/

Componentes reutilizables utilizados en el formulario de registro.

## `CampoTexto.tsx`

Componente reutilizable para campos de texto.
Gestiona de forma común:

- Etiqueta.
- Input.
- Error.
- Estado del campo.

## `CampoSelect.tsx`

Componente reutilizable para campos de selección.

## `FormularioUsuario.tsx`

Agrupa los campos relacionados con los datos personales del usuario durante el registro.

## `MensajeCampo.tsx`

Muestra mensajes de validación asociados a los campos del formulario.

---

# 📁 src/components/reservas/

Componentes reutilizables del proceso de reserva.

## `SelectorDiaReserva.tsx`

Permite seleccionar el día en el que se realizará la reserva.

## `SelectorHoraReserva.tsx`

Muestra los horarios disponibles de una toma.
Permite seleccionar una hora teniendo en cuenta:

- Horas pasadas.
- Reservas existentes.
- Franjas no disponibles.

## `ControlDuracionReserva.tsx`

Permite seleccionar la duración de una reserva.
Trabaja con:

- Incrementos de 30 minutos.
- Duración mínima.
- Duración máxima de 4 horas.

## `ResumenReserva.tsx`

Muestra el resumen final antes de confirmar una reserva.
Incluye:

- Cargador.
- Toma.
- Día.
- Hora de inicio.
- Hora de fin.
- Duración.

---

# 📁 src/context/

Contiene los contextos globales de React.

---

## `AuthContextBase.ts`

Define el contexto de autenticación y su tipo.
Contiene:

- `AuthContextValue`.
- `AuthContext`.

Está separado del proveedor para mantener correctamente la compatibilidad con Fast Refresh.

---

## `AuthContext.tsx`

Contiene `AuthProvider`.
Se encarga de mantener la sesión del usuario disponible para toda la aplicación.
Gestiona:

- Usuario autenticado.
- Estado de carga de la sesión.
- Inicio de sesión.
- Cierre de sesión.
- Rol del usuario.
- Cambios de sesión de Supabase.

---

# 📁 src/hooks/

Hooks personalizados de React.

## `useAuth.ts`

Hook utilizado para acceder al contexto de autenticación.
Permite obtener fácilmente:

- Usuario actual.
- Estado de autenticación.
- Rol.
- Funciones de login y logout.

También evita utilizar `AuthContext` fuera de `AuthProvider`.

---

# 📁 src/data/

Contiene datos locales utilizados por la aplicación.

---

## `cargadores.ts`

Contiene cargadores y situaciones de demostración.
Estos datos se mantienen intencionadamente para que durante las pruebas puedan representarse situaciones como:

- Tomas ocupadas.
- Tomas disponibles.
- Reservas de otros usuarios.
- Estados diferentes de cargadores.

No son datos antiguos ni deben eliminarse durante la limpieza del proyecto.

---

## `clientes.ts`

Contiene los clientes u organizaciones disponibles en el proceso de registro.
Actualmente permite representar la entidad responsable del servicio.

---

# 📁 src/layouts/

Contiene las estructuras visuales comunes utilizadas por varias páginas.

---

## `PrivateLayout.tsx`

Layout utilizado por las páginas privadas del usuario.
Incluye la estructura común del panel:

- Barra superior.
- Menú lateral.
- Área principal de contenido.

Las páginas internas se muestran dentro de este layout mediante React Router.

---

## `AdminLayout.tsx`

Layout exclusivo del panel de administración.
Mantiene la estructura y navegación administrativa separada del panel de usuario.

---

# 📁 src/pages/

Contiene las páginas completas de la aplicación.
Cada carpeta corresponde a una sección o pantalla principal.

---

# 📁 src/pages/Login/

## `LoginPage.tsx`

Pantalla de inicio de sesión.
Gestiona:

- Correo electrónico.
- Contraseña.
- Mostrar u ocultar contraseña.
- Inicio de sesión mediante Supabase.
- Errores de autenticación.
- Acceso al registro.
- Recuperación de contraseña.
- Tema visual.

Según el rol del usuario, después del acceso se redirige al panel correspondiente.

---

# 📁 src/pages/Registro/

## `RegistroPage.tsx`

Formulario de solicitud de alta.
Gestiona:

- Organización o cliente.
- Matrícula.
- Datos personales.
- DNI/NIE.
- Correo.
- Teléfono.
- Contraseña.
- Validaciones.
- Condiciones necesarias para enviar la solicitud.

Una solicitud enviada correctamente queda pendiente de revisión administrativa.

---

# 📁 src/pages/RecuperarContrasena/

## `RecuperarContrasenaPage.tsx`

Pantalla utilizada para iniciar el proceso de recuperación de contraseña.

---

# 📁 src/pages/Inicio/

## `InicioPage.tsx`

Pantalla principal del usuario después de iniciar sesión.
Muestra un resumen del estado de la cuenta y accesos rápidos a las funciones principales.
Puede mostrar información relacionada con:

- Cargadores.
- Reservas.
- Cargas.
- Estado del usuario.
- Actividad reciente.
- Avisos.

---

# 📁 src/pages/Cargadores/

## `CargadoresPage.tsx`

Listado general de cargadores.
Obtiene los datos mediante `chargersService.ts`.
Muestra:

- Nombre.
- Ubicación.
- Estado.
- Tomas disponibles.
- Información general.

---

# 📁 src/pages/DetalleCargador/

## `DetalleCargadorPage.tsx`

Pantalla de detalle de un cargador.
Permite consultar:

- Información del cargador.
- Estado.
- Tomas asociadas.
- Disponibilidad.

También comprueba si el usuario tiene una reserva que pueda iniciarse.

---

# 📁 src/pages/DetalleToma/

## `DetalleTomaPage.tsx`

Pantalla de información específica de una toma.
Permite consultar sus datos antes de continuar hacia el proceso de reserva.

---

# 📁 src/pages/ReservaToma/

## `ReservaTomaPage.tsx`

Pantalla principal para crear una reserva.
Gestiona:

- Día.
- Hora.
- Duración.
- Horarios disponibles.
- Horarios ocupados.
- Reservas DEMO.
- Solapamientos.
- Límite máximo de 4 horas.
- Confirmación de reserva.

---

# 📁 src/pages/Reservas/

## `ReservasPage.tsx`

Pantalla de reservas del usuario.
Divide la información en:

- Reservas activas.
- Histórico.

Permite:

- Consultar reservas futuras.
- Cancelar una reserva confirmada.
- Consultar reservas activas.
- Consultar reservas canceladas.
- Consultar reservas finalizadas.
- Consultar reservas caducadas.

Una reserva que no se inicia dentro del margen permitido pasa automáticamente a estado `caducada`.

---

# 📁 src/pages/CargaActiva/

## `CargaActivaPage.tsx`

Pantalla utilizada mientras una sesión de carga está en curso.
Muestra información como:

- Hora de inicio.
- Tiempo transcurrido.
- Potencia actual.
- Energía suministrada.
- Tiempo restante estimado.
- Hora prevista de finalización.
- Progreso de la sesión.

Permite finalizar manualmente la carga antes de la hora prevista.
También controla el final automático de la sesión cuando se alcanza `fechaHoraFinPrevista`.
Los cálculos de tiempo y energía se limitan al final previsto para evitar que una sesión continúe acumulando datos después de terminar su franja.

---

# 📁 src/pages/Cargas/

## `CargasPage.tsx`

Pantalla de historial de cargas.
Muestra:

- Cargas realizadas.
- Energía total.
- Energía acumulada durante el mes.
- Tiempo acumulado.
- Coste estimado cuando exista tarifa.
- Información de cada sesión.

Mientras existe una carga activa, la página vuelve a consultar los datos periódicamente para reflejar automáticamente los cambios realizados en Supabase.
También actualiza la información cuando el usuario vuelve a la pestaña del navegador.
De esta forma, cuando una carga termina automáticamente, la fila pasa de `En curso` a finalizada sin necesidad de abrir la sesión de carga.

---

# 📁 src/pages/Perfil/

## `PerfilPage.tsx`

Pantalla con los datos del usuario y del vehículo.
Permite consultar y modificar la información autorizada.
Utiliza `usersService.ts` para gestionar los datos del vehículo.

---

# 📁 src/pages/Ayuda/

## `AyudaPage.tsx`

Pantalla informativa sobre el funcionamiento de CargaQuer.
Explica aspectos relacionados con:

- Reservas.
- Inicio de carga.
- Finalización.
- Estados.
- Problemas habituales.

---

# 📁 src/pages/Administracion/

Contiene todas las pantallas exclusivas del administrador.

---

## `AdministracionPage.tsx`

Pantalla principal del panel administrativo.
Muestra un resumen del servicio.
Incluye información como:

- Usuarios registrados.
- Usuarios activos.
- Cargas realizadas.
- Energía suministrada.
- Validaciones pendientes.
- Incidencias.
- Cargadores.
- Tomas.
- Movimientos recientes.

---

## `UsuariosPage.tsx`

Gestión de usuarios.
Muestra:

- Nombre.
- DNI/NIE protegido.
- Correo.
- Matrícula.
- Número de cargas.
- Consumo.
- Estado.

Permite:

- Bloquear usuarios.
- Desbloquear usuarios.

Los valores protegidos del DNI se muestran abreviados para mantener la tabla legible.

---

## `ValidacionesPage.tsx`

Muestra las solicitudes de registro pendientes.
El administrador puede:

- Revisar la solicitud.
- Aceptarla.
- Rechazarla.

La aceptación utiliza el flujo de solicitudes almacenado en Supabase.

---

## `CargadoresAdminPage.tsx`

Pantalla administrativa de cargadores.
Muestra las tomas agrupadas por cargador.

Incluye:

- Cargador.
- Toma.
- Estado.
- Incidencias.
- Cargas semanales.
- Potencia.
- Cargas mensuales.
- Cargas anuales.
- Energía suministrada.

---

## `IncidenciasAdminPage.tsx`

Pantalla de incidencias.
Muestra:

- Cargador afectado.
- Toma.
- Tipo de incidencia.
- Descripción.
- Estado.
- Empresa suministradora.
- Teléfono.
- Correo.
- Empresa instaladora.
- Datos de contacto.

Incluye datos DEMO cuando la información necesaria no está disponible.

---

# 📁 src/router/

Gestiona las rutas de la aplicación.

---

## `AppRouter.tsx`

Configuración principal de React Router.

Define:

- Rutas públicas.
- Rutas privadas.
- Rutas administrativas.
- Layouts.
- Redirecciones.

---

## `PrivateRoute.tsx`

Protege las páginas privadas.

Comprueba que:

- La sesión haya terminado de cargarse.
- Exista un usuario autenticado.
- El usuario tenga acceso al panel privado.

---

## `AdminRoute.tsx`

Protege las rutas administrativas.
Solo permite el acceso a usuarios con rol de administrador.

---

# 📁 src/services/

Contiene la comunicación con Supabase y la lógica de acceso a datos.
Las páginas utilizan estos servicios para evitar realizar consultas directamente desde los componentes.

---

## `supabaseClient.ts`

Configura el cliente de Supabase utilizado en toda la aplicación.

Lee las variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Exporta una única instancia de Supabase reutilizada por todos los servicios.

---

## `authService.ts`

Gestiona la autenticación.

Incluye operaciones relacionadas con:

- Inicio de sesión.
- Cierre de sesión.
- Recuperación de la sesión.
- Datos del usuario autenticado.
- Roles.
- Estado de cuenta.

---

## `registroService.ts`

Gestiona el envío de solicitudes de registro.

Realiza tareas como:

- Normalizar matrícula.
- Normalizar DNI/NIE.
- Generar un hash SHA-256 del documento.
- Crear el usuario inicial en Supabase Auth.
- Ejecutar el procesamiento de la solicitud.
- Cerrar la sesión temporal creada durante el registro.

---

## `solicitudesRegistroService.ts`

Gestiona las solicitudes pendientes desde el panel administrativo.

Permite:

- Obtener solicitudes pendientes.
- Aprobar solicitudes.
- Rechazar solicitudes.
- Obtener el número de solicitudes pendientes para el resumen administrativo.

Utiliza las funciones RPC de Supabase correspondientes al proceso de aprobación y rechazo.

---

## `chargersService.ts`

Gestiona cargadores y tomas.

Permite:

- Obtener cargadores.
- Buscar cargadores concretos.
- Obtener información de sus tomas.
- Combinar datos reales con situaciones DEMO necesarias para las pruebas.

---

## `reservationsService.ts`

Contiene la lógica principal de las reservas.

Gestiona:

- Creación.
- Consulta.
- Cancelación.
- Activación.
- Caducidad.
- Estados.
- Solapamientos.
- Reservas de una toma.
- Reservas del usuario.
- Reservas DEMO.
- Fechas de inicio y fin.

También controla el margen disponible para iniciar una carga.

---

## `cargasService.ts`

Gestiona las sesiones de carga.

Permite:

- Obtener las cargas de un usuario.
- Obtener una carga activa.
- Buscar una carga por reserva.
- Buscar una carga activa en una toma.
- Iniciar una carga.
- Finalizar una carga.
- Actualizar la reserva asociada al terminar.

También controla los cálculos de tiempo y energía de las cargas.
Cuando una carga supera su hora prevista, los cálculos se limitan a `fechaHoraFinPrevista`.
Esto evita que una sesión siga acumulando duración o energía después de finalizar su franja reservada.

---

## `usersService.ts`

Gestiona los datos relacionados con el vehículo.

Permite:

- Obtener el vehículo de un usuario.
- Actualizar matrícula.
- Comprobar si el vehículo está validado.
- Comprobar si el usuario puede reservar.
- Comprobar si puede iniciar una carga.

---

## `panelUsuarioService.ts`

Obtiene y prepara la información necesaria para la pantalla de inicio del usuario.

Agrupa datos procedentes de diferentes partes de la aplicación para construir el resumen del panel.

---

## `estadisticasService.ts`

Contiene cálculos relacionados con el historial de cargas.

Permite preparar estadísticas como:

- Energía acumulada.
- Tiempo acumulado.
- Datos resumidos de las sesiones.

---

## `adminService.ts`

Servicio principal del panel administrativo.

Gestiona:

- Usuarios.
- Bloqueo y desbloqueo.
- Cargadores.
- Tomas.
- Estadísticas administrativas.
- Incidencias.
- Resumen general.
- Datos DEMO de administración.

---

# 📁 src/types/

Contiene los tipos e interfaces de TypeScript.

Centraliza las estructuras utilizadas por componentes, páginas y servicios.

---

## `auth.ts`

Tipos relacionados con autenticación.

Incluye estructuras para:

- Usuario autenticado.
- Credenciales.
- Sesión.
- Roles.
- Estados de cuenta.

---

## `carga.ts`

Tipos relacionados con las cargas.

Define:

- Estados.
- Estructura de una carga.
- Datos necesarios para iniciar una carga.

---

## `charger.ts`

Tipos de cargadores y tomas.

Define estructuras utilizadas para representar:

- Cargadores.
- Tomas.
- Estados.
- Potencia.
- Disponibilidad.

---

## `cliente.ts`

Tipos relacionados con los clientes u organizaciones que utilizan CargaQuer.

---

## `panelUsuario.ts`

Tipos utilizados en el panel principal del usuario.

Incluye estructuras relacionadas con:

- Resumen.
- Alertas.
- Actividad.
- Estado.

---

## `registro.ts`

Tipos utilizados durante el proceso de registro.

Define:

- Datos del formulario.
- Usuario principal.
- Tipo de usuario.
- Filiación.
- Errores.
- Datos necesarios para enviar la solicitud.

---

## `reservation.ts`

Tipos relacionados con reservas.

Incluye:

- Estado de reserva.
- Datos para crear una reserva.
- Reserva almacenada.
- Reserva con fechas completas.

Estados utilizados:

```text
confirmada
activa
finalizada
cancelada
caducada
```

---

## `user.ts`

Tipos relacionados con el vehículo del usuario.

Incluye:

- Datos del vehículo.
- Estado de validación.

---

# 📁 src/utils/

Funciones auxiliares reutilizables.

---

## `validators.ts`

Funciones utilizadas para validar datos de formularios.

Incluye comprobaciones relacionadas con:

- Correo.
- Contraseña.
- DNI/NIE.
- Teléfono.
- Matrícula.

---

## `formateadores.ts`

Funciones reutilizables para presentar información.

Actualmente contiene el formateo común de la duración de las reservas.

Este archivo evita duplicar funciones de formato entre diferentes componentes.

---

# 📁 src/styles/

Contiene todos los estilos CSS.

Los estilos se mantienen separados de los componentes y páginas.

La estructura actual es:

```text
styles/
├── Administracion/
├── Ayuda/
├── CargaActiva/
├── Cargadores/
├── Cargas/
├── DetalleCargador/
├── DetalleToma/
├── Login/
├── PanelUsuario/
├── Perfil/
├── RecuperarContrasena/
├── Registro/
├── ReservaToma/
├── Reservas/
├── global.css
└── variables.css
```

---

## `variables.css`

Contiene variables CSS reutilizadas por toda la aplicación.

Centraliza valores visuales como:

- Colores.
- Fondos.
- Bordes.
- Sombras.
- Radios.
- Valores comunes.

---

## `global.css`

Contiene los estilos generales.

Gestiona aspectos como:

- `box-sizing`.
- `body`.
- Tipografía.
- Fondo.
- Elementos globales.
- Comportamientos generales de la interfaz.

---

# 📁 src/styles/Administracion/

## `AdministracionPage.css`

Estilos del resumen administrativo.

## `UsuariosPage.css`

Estilos de la tabla y gestión de usuarios.

## `ValidacionesPage.css`

Estilos de las solicitudes pendientes.

## `CargadoresAdminPage.css`

Estilos de la gestión de cargadores y tomas.

## `IncidenciasAdminPage.css`

Estilos de las tarjetas de incidencias.

## `AdminLayout.css`

Estilos generales del layout administrativo.

---

# 📁 src/styles/PanelUsuario/

## `InicioPage.css`

Estilos de la pantalla principal del usuario.

## `PrivateLayout.css`

Estilos de la estructura general del panel privado.

---

# 📁 src/styles/Cargadores/

## `CargadoresPage.css`

Estilos del listado de cargadores.

---

# 📁 src/styles/DetalleCargador/

## `DetalleCargadorPage.css`

Estilos de la pantalla de detalle del cargador.

---

# 📁 src/styles/DetalleToma/

## `DetalleTomaPage.css`

Estilos de la pantalla de detalle de una toma.

---

# 📁 src/styles/ReservaToma/

## `ReservaTomaPage.css`

Estilos del proceso de creación de reservas.

---

# 📁 src/styles/Reservas/

## `ReservasPage.css`

Estilos de Mis reservas y del histórico.

---

# 📁 src/styles/CargaActiva/

## `CargaActivaPage.css`

Estilos de la pantalla de carga en curso.

---

# 📁 src/styles/Cargas/

## `CargasPage.css`

Estilos del historial de cargas.

---

# 📁 src/styles/Perfil/

## `PerfilPage.css`

Estilos de la página de perfil.

---

# 📁 src/styles/Ayuda/

## `AyudaPage.css`

Estilos de la página de ayuda.

---

# 📁 src/styles/Login/

## `LoginPage.css`

Estilos de la pantalla de inicio de sesión.

---

# 📁 src/styles/Registro/

## `RegistroPage.css`

Estilos del formulario de registro.

---

# 📁 src/styles/RecuperarContrasena/

## `RecuperarContrasenaPage.css`

Estilos de la recuperación de contraseña.

---

# `src/App.tsx`

Componente principal de React.

Integra:

- `AuthProvider`.
- `AppRouter`.

Sirve como punto de unión entre el contexto global y el sistema de rutas.

---

# `src/main.tsx`

Punto de entrada del frontend.

Se encarga de:

- Crear la raíz de React.
- Renderizar `App`.
- Cargar los estilos globales.
- Inicializar la configuración visual necesaria al arrancar.

---

# 📁 supabase/

Contiene la parte del proyecto relacionada con Supabase que se mantiene junto al código fuente.

La estructura principal es:

```text
supabase/
├── functions/
└── migrations/
```

La carpeta temporal `.temp/` es generada por Supabase CLI y no forma parte del código fuente.

---

# 📁 supabase/functions/

Contiene las Edge Functions.

Estas funciones se ejecutan en Supabase y permiten realizar procesos que no deben depender directamente del navegador.

---

## 📁 `procesar-avisos/`

### `index.ts`

Gestiona los avisos de correo y determinados procesos automáticos de CargaQuer.

Procesa información de `avisos_email` y utiliza el servicio de correo configurado en Supabase.

Entre los avisos previstos se encuentran:

- Aviso previo al inicio de una reserva.
- Aviso previo al final de una carga.
- Avisos relacionados con aprobaciones.

Cuando la función es ejecutada desde el proceso automático también puede:

- Caducar reservas que no se han iniciado dentro del margen permitido.
- Finalizar cargas que han alcanzado su hora prevista.

El resultado del procesamiento incluye información sobre:

- Reservas caducadas.
- Cargas finalizadas.
- Accesos aprobados.
- Avisos de reserva enviados.
- Avisos de fin de carga enviados.

También registra el resultado de los correos para evitar envíos duplicados.

---

## 📁 `procesar-solicitudes/`

### `index.ts`

Gestiona el procesamiento de nuevas solicitudes de registro.

Se utiliza después del alta inicial para preparar y enviar los avisos relacionados con una nueva solicitud pendiente.

---

# 📁 supabase/migrations/

Contiene scripts SQL utilizados para configurar o actualizar la base de datos.

---

## `solicitudes_registro.sql`

Configura el sistema de solicitudes de registro.

Incluye la lógica SQL necesaria para:

- Solicitudes pendientes.
- Aprobación.
- Rechazo.
- Creación de los datos necesarios después de la aprobación.
- Limpieza del flujo antiguo de registro.

---

## `automatizaciones.sql`

Contiene la configuración SQL relacionada con automatizaciones y avisos.

Incluye elementos necesarios para trabajar con los avisos almacenados en `avisos_email`.

También contiene funciones utilizadas para:

- Detectar reservas próximas.
- Detectar cargas próximas a finalizar.
- Caducar reservas no iniciadas.
- Preparar información necesaria para los avisos automáticos.

---

## `cargaquer_finalizar_cargas_vencidas.sql`

Configura la finalización automática de las sesiones de carga.

Crea la función:

```text
cargaquer_finalizar_cargas_vencidas()
```

Esta función busca cargas que cumplan:

```text
estado = activa
fecha_hora_fin_prevista <= fecha actual
```

Cuando encuentra una carga vencida:

- Cambia su estado a `finalizada`.
- Guarda `fecha_hora_fin_real` utilizando la hora prevista.
- Calcula la energía únicamente hasta el final de la sesión.
- Finaliza también la reserva asociada si continúa activa.

También crea:

```text
cargaquer_procesar_estados_automaticos()
```

Esta función agrupa los procesos automáticos de:

- Caducidad de reservas no iniciadas.
- Finalización de cargas vencidas.

El archivo habilita `pg_cron` y registra el trabajo:

```text
cargaquer-estados-automaticos
```

Este trabajo se ejecuta cada minuto.

Gracias a esta automatización, las reservas y cargas pueden actualizar su estado aunque el usuario haya cerrado sesión, el navegador o la aplicación.

---

# 📌 Tablas principales de Supabase

CargaQuer trabaja principalmente con las siguientes tablas:

```text
perfiles
vehiculos
cargadores
tomas
reservas
cargas
incidencias
solicitudes_registro
avisos_email
```

---

## `perfiles`

Contiene los perfiles de usuarios autorizados.

Incluye información necesaria para:

- Identificación.
- Rol.
- Estado de cuenta.
- Gestión administrativa.

---

## `vehiculos`

Contiene los vehículos vinculados a los usuarios.

Incluye datos como:

- Usuario.
- Matrícula.
- Estado de validación.

---

## `cargadores`

Contiene los cargadores disponibles en el sistema.

---

## `tomas`

Contiene las tomas asociadas a cada cargador.

---

## `reservas`

Contiene las reservas realizadas.

Incluye:

- Usuario.
- Cargador.
- Toma.
- Fecha.
- Hora de inicio.
- Hora de fin.
- Estado.

---

## `cargas`

Contiene las sesiones reales de carga.

Mantiene información independiente de la reserva que originó la sesión.

---

## `incidencias`

Contiene las incidencias relacionadas con cargadores y tomas.

---

## `solicitudes_registro`

Contiene las solicitudes pendientes de aprobación administrativa.

---

## `avisos_email`

Registra los correos que deben enviarse o que ya han sido procesados.

Permite controlar:

- Tipo de aviso.
- Estado.
- Resultado del envío.
- Intentos.

---

# 📌 Variables de entorno

El frontend utiliza:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Estas variables se utilizan en:

```text
src/services/supabaseClient.ts
```

Los valores reales se mantienen fuera del código fuente.

Las Edge Functions utilizan variables configuradas como secretos dentro de Supabase.

Entre ellas:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
EMAIL_FROM
CRON_SECRET
```

Estos valores tampoco deben almacenarse directamente en el repositorio.

---

# 📌 Organización de rutas

Las rutas principales están definidas en:

```text
src/router/AppRouter.tsx
```

La aplicación se divide en tres zonas.

## Públicas

```text
/login
/registro
/recuperar-contrasena
```

## Panel de usuario

```text
/panel
/panel/cargadores
/panel/cargadores/:cargadorId
/panel/cargadores/:cargadorId/tomas/:tomaId
/panel/cargadores/:cargadorId/tomas/:tomaId/reservar
/panel/cargas/:cargaId
/panel/mis-cargas
/panel/mis-reservas
/panel/ayuda
/panel/perfil
```

## Administración

```text
/administracion
/administracion/usuarios
/administracion/validaciones
/administracion/cargadores
/administracion/incidencias
```

---

# 📌 Flujo de autenticación

El flujo principal de autenticación es:

```text
Login
   │
   ▼
authService.ts
   │
   ▼
Supabase Auth
   │
   ▼
AuthContext
   │
   ├── Usuario ──► Panel privado
   │
   └── Administrador ──► Panel administrativo
```

---

# 📌 Flujo de registro

El proceso de registro funciona de la siguiente forma:

```text
Registro
   │
   ▼
Validación del formulario
   │
   ▼
registroService.ts
   │
   ▼
Supabase Auth
   │
   ▼
solicitudes_registro
   │
   ▼
Validación administrativa
   │
   ├── Aceptar
   │
   └── Rechazar
```

El usuario no obtiene acceso normal al servicio hasta que la solicitud es aprobada.

---

# 📌 Flujo de una reserva

```text
Seleccionar cargador
        │
        ▼
Seleccionar toma
        │
        ▼
Seleccionar día
        │
        ▼
Seleccionar hora
        │
        ▼
Seleccionar duración
        │
        ▼
Comprobar disponibilidad
        │
        ▼
Crear reserva
```

Las reservas:

- Funcionan en bloques de 30 minutos.
- Tienen un máximo de 4 horas.
- Comprueban solapamientos.
- Admiten reservas que terminan al día siguiente.
- Pueden cancelarse mientras estén confirmadas.
- Caducan si la carga no se inicia dentro del margen permitido.

---

# 📌 Estados de reserva

```text
confirmada
activa
finalizada
cancelada
caducada
```

### `confirmada`

Reserva creada y pendiente de iniciar.

### `activa`

La carga asociada ya ha comenzado.

### `finalizada`

La reserva terminó correctamente.

### `cancelada`

El usuario canceló la reserva.

### `caducada`

La reserva no se inició dentro de los 15 minutos disponibles.

---

# 📌 Flujo de carga

```text
Reserva confirmada
       │
       ▼
Inicio de carga
       │
       ▼
Carga activa
       │
       ├── Finalización manual
       │
       └── Finalización automática
                │
                ▼
       Histórico de cargas
```

La carga puede finalizar de dos formas:

- Manualmente, si el usuario termina antes de la hora prevista.
- Automáticamente, cuando alcanza el final de la reserva.

La reserva y la carga se almacenan de forma separada.

Esto permite mantener:

- Estado de la reserva.
- Estado real de la sesión.
- Histórico de utilización.
- Estadísticas.

---

# 📌 Automatización de estados

CargaQuer utiliza procesos automáticos en Supabase para mantener actualizados los estados de reservas y cargas.

La automatización principal utiliza `pg_cron`.

Cada minuto se ejecuta:

```text
cargaquer_procesar_estados_automaticos()
```

Esta función ejecuta dos procesos:

```text
cargaquer_caducar_reservas_no_iniciadas()
cargaquer_finalizar_cargas_vencidas()
```

## Caducidad de reservas

Si una reserva confirmada no inicia una carga dentro de los 15 minutos permitidos:

```text
confirmada → caducada
```

La franja deja de bloquear la toma y vuelve a quedar disponible para otros usuarios.

## Finalización de cargas

Si una carga activa alcanza su hora prevista:

```text
activa → finalizada
```

La finalización utiliza la hora prevista como límite.

Esto evita que una carga continúe acumulando:

- Tiempo.
- Energía.
- Estadísticas.

después de terminar su franja.

La automatización funciona aunque:

- El usuario cierre sesión.
- Cierre el navegador.
- Cierre la aplicación.
- No vuelva a entrar en la pantalla de carga.

El frontend mantiene además comprobaciones adicionales para reflejar estos cambios correctamente en la interfaz.

Mientras existe una carga activa, `CargasPage.tsx` consulta periódicamente los datos para detectar el cambio de estado y actualizar automáticamente el historial.

---

# 📌 Datos DEMO

CargaQuer contiene situaciones de demostración creadas intencionadamente.

Se utilizan para que determinadas pantallas no aparezcan vacías durante las pruebas.

Pueden representar:

- Cargadores ocupados.
- Tomas reservadas.
- Reservas de otros usuarios.
- Usuarios administrativos.
- Incidencias.
- Actividad reciente.

Estos datos forman parte del entorno de demostración y no deben confundirse con código obsoleto.

---

# 📌 Separación general del proyecto

La aplicación sigue esta organización:

- `components/` → componentes reutilizables.
- `context/` → estado global.
- `data/` → datos locales y DEMO.
- `hooks/` → hooks personalizados.
- `layouts/` → estructuras comunes.
- `pages/` → pantallas completas.
- `router/` → rutas y protección.
- `services/` → lógica y acceso a Supabase.
- `styles/` → estilos CSS.
- `types/` → tipos e interfaces.
- `utils/` → funciones auxiliares.
- `supabase/functions/` → lógica ejecutada en Supabase.
- `supabase/migrations/` → configuración SQL de la base de datos.

---

