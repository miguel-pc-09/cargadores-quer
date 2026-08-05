# 📂 Estructura del proyecto

Este documento explica la función de cada carpeta y archivo principal del proyecto.

---

# 📁 src/

Contiene todo el código fuente de la aplicación.

Todo el desarrollo principal se realiza dentro de esta carpeta.

---

# 📁 assets/

Recursos estáticos de la aplicación.

Puede contener:

- Logos.
- Imágenes.
- Iconos.
- Fuentes.
- Archivos multimedia.

No contiene lógica de la aplicación.

---

# 📁 components/

Componentes reutilizables de React.

Aquí se guardan elementos que pueden utilizarse en varias páginas.

Ejemplos:

- Header.
- Sidebar.
- Botones.
- Tarjetas.
- Modales.
- Loader.
- Formularios reutilizables.

## 📁 common/

Componentes genéricos reutilizables en distintas partes de la aplicación.

Ejemplos:

- Botones.
- Ventanas modales.
- Indicadores de carga.
- Mensajes de estado.

## 📁 navigation/

Componentes relacionados con la navegación.

Ejemplos:

- Header.
- Sidebar.
- Menú móvil.

## 📁 cargadores/

Componentes reutilizables relacionados con los cargadores.

Ejemplos:

- Tarjeta de cargador.
- Estado de un conector.
- Información de una toma.

---

# 📁 layouts/

Plantillas generales de la aplicación.

Permiten reutilizar una misma estructura visual en varias páginas.

## PublicLayout.tsx

Diseño utilizado por las páginas públicas.

Ejemplos:

- Login.
- Registro.
- Recuperar contraseña.

## PrivateLayout.tsx

Diseño utilizado por las páginas privadas del usuario.

Ejemplos:

- Inicio.
- Cargadores.
- Mis cargas.
- Mis reservas.
- Ayuda.
- Perfil.

## AdminLayout.tsx

Diseño exclusivo del panel de administración.

---

# 📁 pages/

Cada carpeta representa una página completa de la aplicación.

## 📁 Inicio/

### InicioPage.tsx

Pantalla principal del usuario después de iniciar sesión.

Mostrará accesos rápidos a:

- Cargadores.
- Historial de cargas.
- Reservas.
- Ayuda.
- Perfil.

---

## 📁 Cargadores/

### CargadoresPage.tsx

Listado de cargadores disponibles.

Mostrará:

- Nombre del cargador.
- Número de conectores.
- Estado de cada conector.
- Acciones disponibles.

---

## 📁 Cargas/

### CargasPage.tsx

Historial de todas las cargas realizadas por el usuario.

---

## 📁 Reservas/

### ReservasPage.tsx

Gestión de las reservas del usuario.

Mostrará:

- Reservas activas.
- Historial de reservas.

---

## 📁 Ayuda/

### AyudaPage.tsx

Explicaciones sobre el funcionamiento de la aplicación.

Contendrá información sobre:

- Cómo reservar.
- Cómo iniciar una carga.
- Cómo finalizar una carga.
- Significado de los estados.
- Problemas frecuentes.
- Contacto o asistencia.

---

## 📁 Perfil/

### PerfilPage.tsx

Datos personales del usuario.

Los campos aparecerán bloqueados inicialmente.

El usuario deberá pulsar el botón de edición antes de modificar los datos permitidos.

---

## 📁 Login/

### LoginPage.tsx

Pantalla de inicio de sesión.

Incluye:

- Email.
- Contraseña.
- Mostrar u ocultar contraseña.
- Recordar sesión.
- Recuperar contraseña.
- Enlace al registro.
- Validación de campos.
- Avisos de error.

---

## 📁 Registro/

### RegistroPage.tsx

Formulario de solicitud de alta de nuevos usuarios.

Incluye:

- Selección de ayuntamiento u organización.
- Datos del vehículo.
- Datos del usuario principal.
- Segundo conductor opcional.
- Aceptación del tratamiento de datos.
- Validación de todos los campos.

Después de enviar correctamente la solicitud, el usuario será redirigido al Login.

---

## 📁 Administracion/

### AdministracionPage.tsx

Panel exclusivo para administradores.

Permitirá gestionar:

- Solicitudes pendientes.
- Usuarios.
- Ayuntamientos o empresas.
- Cargadores.
- Conectores.
- Reservas.
- Cargas.

---

# 📁 router/

Gestión de todas las rutas de la aplicación.

Aquí se define qué página se muestra según la URL.

## AppRouter.tsx

Contendrá la configuración principal de rutas.

## PrivateRoute.tsx

Controlará el acceso a páginas privadas.

Solo permitirá entrar a usuarios autenticados.

## AdminRoute.tsx

Controlará el acceso al panel de administración.

Solo permitirá entrar a usuarios administradores.

---

# 📁 services/

Contiene la comunicación con Supabase y el acceso a la base de datos.

Toda llamada a la base de datos debe realizarse desde esta carpeta.

## supabase.ts

Configuración de la conexión con Supabase.

## authService.ts

Gestionará:

- Inicio de sesión.
- Cierre de sesión.
- Registro.
- Recuperación de contraseña.
- Sesión del usuario.

## chargersService.ts

Gestionará los cargadores y sus conectores.

## reservationsService.ts

Gestionará las reservas.

## usersService.ts

Gestionará los datos de los usuarios.

Más adelante se podrán añadir otros servicios, por ejemplo:

- `clientesService.ts`
- `cargasService.ts`
- `correoService.ts`

---

# 📁 hooks/

Hooks personalizados de React.

Contienen lógica reutilizable.

## useAuth.ts

Gestionará el usuario autenticado y su sesión.

## useChargers.ts

Gestionará la carga de datos de los cargadores.

## useReservations.ts

Gestionará las reservas del usuario.

---

# 📁 context/

Contextos globales de React.

## AuthContext.tsx

Permitirá compartir la información del usuario autenticado entre distintas páginas y componentes.

---

# 📁 types/

Interfaces y tipos de TypeScript.

Centraliza los modelos de datos utilizados en la aplicación.

## auth.ts

Tipos relacionados con la autenticación.

## user.ts

Tipos generales relacionados con los usuarios.

## charger.ts

Tipos relacionados con cargadores y conectores.

## reservation.ts

Tipos relacionados con las reservas.

## cliente.ts

Define la estructura de los ayuntamientos, empresas u organizaciones que utilizan la aplicación.

Ejemplos de datos:

- Identificador.
- Nombre.
- Tipo de entidad.
- Correo para recibir solicitudes.
- Estado activo o inactivo.

## registro.ts

Contiene los tipos e interfaces utilizados por el formulario de registro.

Incluye:

- Datos del vehículo.
- Datos del usuario principal.
- Datos del segundo conductor.
- Tipo de usuario.
- Filiación con el ayuntamiento.
- Errores del formulario.

---

# 📁 data/

Datos provisionales utilizados durante el desarrollo.

## mockChargers.ts

Datos de ejemplo de los cargadores.

Se utilizarán mientras la aplicación todavía no esté conectada a Supabase.

## clientes.ts

Listado provisional de ayuntamientos, empresas u organizaciones disponibles en el formulario de registro.

Más adelante estos datos se obtendrán desde la base de datos.

---

# 📁 utils/

Funciones auxiliares reutilizables.

## validators.ts

Funciones de validación.

Ejemplos:

- Email.
- Contraseña.
- DNI o NIE.
- Teléfono.
- Matrícula.

## formatters.ts

Funciones para dar formato a los datos.

Ejemplos:

- Fechas.
- Horas.
- Teléfonos.
- Matrículas.

## constants.ts

Valores fijos utilizados en distintas partes de la aplicación.

Ejemplos:

- Estados de solicitud.
- Tipos de usuario.
- Estados de conectores.
- Textos comunes.

---

# 📁 styles/

Contiene todos los estilos CSS del proyecto.

Las páginas están separadas de sus estilos.

## variables.css

Variables CSS reutilizables en toda la aplicación.

Contiene:

- Colores.
- Bordes.
- Sombras.
- Radios.
- Tamaños comunes.

## global.css

Estilos generales aplicados a toda la aplicación.

Contiene:

- Box sizing.
- Estilos de `body`.
- Tipografía general.
- Configuración básica de botones, inputs y enlaces.

## responsive.css

Estilos responsive comunes para varias páginas.

Puede permanecer vacío si cada página gestiona su propio responsive.

## 📁 Login/

### LoginPage.css

Estilos exclusivos de la página de Login.

## 📁 Registro/

### RegistroPage.css

Estilos exclusivos de la página de Registro.

En el futuro se crearán carpetas equivalentes para cada página:

- `Inicio/`
- `Cargadores/`
- `Cargas/`
- `Reservas/`
- `Ayuda/`
- `Perfil/`
- `Administracion/`

---

# App.tsx

Componente principal de la aplicación.

Actualmente contiene las rutas básicas.

Más adelante podrá delegar toda la configuración de rutas a `router/AppRouter.tsx`.

---

# main.tsx

Punto de entrada de React.

Se encarga de:

- Cargar la aplicación.
- Renderizar `App`.
- Importar los estilos globales.

---

# vite-env.d.ts

Declaraciones de tipos necesarias para trabajar con Vite y TypeScript.

---

# 📌 Organización general

La aplicación sigue esta separación:

- `pages/` contiene las páginas.
- `styles/` contiene los estilos.
- `components/` contiene elementos reutilizables.
- `services/` contiene acceso a la base de datos.
- `types/` contiene interfaces y tipos.
- `data/` contiene datos provisionales.
- `utils/` contiene funciones auxiliares.
- `router/` contiene las rutas.
- `layouts/` contiene las estructuras visuales comunes.

---

# 📌 Flujo principal de la aplicación

1. El usuario accede al Login.
2. Si no tiene cuenta, solicita el registro.
3. La solicitud queda pendiente.
4. La entidad responsable revisa la solicitud.
5. El usuario recibe un correo cuando la cuenta es aprobada.
6. El usuario inicia sesión.
7. Accede a cargadores, reservas, cargas, ayuda y perfil.