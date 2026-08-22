import { useCallback, useEffect, useState } from "react";

import {
  bloquearUsuario,
  desbloquearUsuario,
  obtenerUsuariosAdministracion,
  type UsuarioAdministracion,
} from "../../services/adminService";

import "../../styles/Administracion/UsuariosPage.css";

// Función para obtener el nombre completo.
function obtenerNombreCompleto(usuario: UsuarioAdministracion) {
  return `${usuario.nombre} ${usuario.apellidos}`.trim();
}

// Función para formatear el DNI protegido.
function formatearDniProtegido(valor: string) {
  const dni = valor.trim();

  if (!dni || dni === "—") {
    return "—";
  }

  if (dni.length <= 12) {
    return dni;
  }

  return `${dni.slice(0, 6).toUpperCase()}…${dni.slice(-4).toUpperCase()}`;
}

function UsuariosPage() {
  // Estado para guardar los usuarios.
  const [usuarios, setUsuarios] = useState<UsuarioAdministracion[]>([]);

  // Estado para controlar la carga.
  const [cargando, setCargando] = useState(true);

  // Estado para guardar el usuario en proceso.
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  // Estado para guardar errores.
  const [error, setError] = useState("");

  // Función para cargar los usuarios.
  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);

      setError("");

      const resultado = await obtenerUsuariosAdministracion();

      setUsuarios(resultado);
    } catch (errorCarga) {
      setError(
        errorCarga instanceof Error
          ? errorCarga.message
          : "No se han podido cargar los usuarios.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga los usuarios al abrir la pantalla.
  useEffect(() => {
    void cargarUsuarios();
  }, [cargarUsuarios]);

  // Función para cambiar el estado de un usuario.
  async function cambiarEstadoUsuario(usuario: UsuarioAdministracion) {
    if (procesandoId) {
      return;
    }

    try {
      setProcesandoId(usuario.id);

      setError("");

      if (usuario.estadoCuenta === "bloqueada") {
        await desbloquearUsuario(usuario.id);

        setUsuarios((usuariosActuales) =>
          usuariosActuales.map((usuarioActual) =>
            usuarioActual.id === usuario.id
              ? {
                  ...usuarioActual,
                  estadoCuenta: "verificada",
                }
              : usuarioActual,
          ),
        );

        return;
      }

      await bloquearUsuario(usuario.id);

      setUsuarios((usuariosActuales) =>
        usuariosActuales.map((usuarioActual) =>
          usuarioActual.id === usuario.id
            ? {
                ...usuarioActual,
                estadoCuenta: "bloqueada",
              }
            : usuarioActual,
        ),
      );
    } catch (errorCambio) {
      setError(
        errorCambio instanceof Error
          ? errorCambio.message
          : "No se ha podido modificar el estado del usuario.",
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <section className="usuarios-admin">
      <header className="usuarios-admin__cabecera">
        <span className="usuarios-admin__etiqueta">Panel municipal</span>

        <h1>Usuarios</h1>

        <p>
          Consulta los usuarios autorizados del servicio y gestiona el acceso a
          sus cuentas.
        </p>
      </header>

      {error && (
        <div className="usuarios-admin__error" role="alert">
          <span aria-hidden="true">!</span>

          <p>{error}</p>
        </div>
      )}

      <section className="usuarios-admin__panel">
        <header className="usuarios-admin__panel-cabecera">
          <div>
            <span className="usuarios-admin__etiqueta">Gestión</span>

            <h2>Usuarios registrados</h2>
          </div>

          <span className="usuarios-admin__contador">{usuarios.length}</span>
        </header>

        {cargando ? (
          <div className="usuarios-admin__cargando">
            <span className="usuarios-admin__spinner" />

            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <div className="usuarios-admin__tabla-contenedor">
            <table className="usuarios-admin__tabla">
              <thead>
                <tr>
                  <th>Nombre</th>

                  <th>DNI / NIE</th>

                  <th>Correo</th>

                  <th>Matrícula</th>

                  <th>Nº cargas</th>

                  <th>Consumo</th>

                  <th>Estado</th>

                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="usuarios-admin__fila-vacia">
                      No hay usuarios disponibles.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => {
                    // Comprueba si el usuario está bloqueado.
                    const bloqueado = usuario.estadoCuenta === "bloqueada";

                    // Comprueba si el usuario se está procesando.
                    const procesando = procesandoId === usuario.id;

                    return (
                      <tr key={usuario.id}>
                        <td>
                          <strong>{obtenerNombreCompleto(usuario)}</strong>
                        </td>

                        <td>{formatearDniProtegido(usuario.dni)}</td>

                        <td>{usuario.email}</td>

                        <td>
                          <span className="usuarios-admin__matricula">
                            {usuario.matricula}
                          </span>
                        </td>

                        <td>{usuario.numeroCargas}</td>

                        <td>
                          {usuario.energiaConsumidaKwh.toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          kWh
                        </td>

                        <td>
                          <span
                            className={`usuarios-admin__estado ${
                              bloqueado
                                ? "usuarios-admin__estado--bloqueado"
                                : "usuarios-admin__estado--activo"
                            }`}
                          >
                            {bloqueado ? "Bloqueado" : "Activo"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={`usuarios-admin__boton ${
                              bloqueado
                                ? "usuarios-admin__boton--desbloquear"
                                : "usuarios-admin__boton--bloquear"
                            }`}
                            disabled={procesando}
                            onClick={() => void cambiarEstadoUsuario(usuario)}
                          >
                            {procesando
                              ? "Procesando..."
                              : bloqueado
                                ? "Desbloquear"
                                : "Bloquear"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default UsuariosPage;
