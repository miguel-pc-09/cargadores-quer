import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { Link, useNavigate } from "react-router-dom";

import CampoSelect from "../../components/registro/CampoSelect";
import CampoTexto from "../../components/registro/CampoTexto";
import FormularioUsuario from "../../components/registro/FormularioUsuario";
import MensajeCampo from "../../components/registro/MensajeCampo";

import { clientes } from "../../data/clientes";

import { enviarSolicitudRegistro } from "../../services/registroService";

import type {
  DatosFormularioRegistro,
  DatosUsuarioRegistro,
  ErroresRegistro,
} from "../../types/registro";

import {
  normalizarDocumento,
  validarDocumento,
  validarEmail,
  validarMatricula,
  validarTelefono,
} from "../../utils/validators";

import "../../styles/Registro/RegistroPage.css";

type Tema = "oscuro" | "claro";

const TEMA_GUARDADO = "cargaquer-tema";

const usuarioVacio: DatosUsuarioRegistro = {
  nombre: "",
  apellidos: "",
  email: "",
  contrasena: "",
  repetirContrasena: "",
  dni: "",
  telefono: "",
  filiacion: "",
};

const formularioInicial: DatosFormularioRegistro = {
  clienteId: "",
  matricula: "",
  tipoUsuario: "",
  usuarioPrincipal: {
    ...usuarioVacio,
  },
  tieneSegundoConductor: false,
  segundoConductor: {
    ...usuarioVacio,
  },
  haLeidoAviso: false,
  aceptaCondiciones: false,
};

function RegistroPage() {
  const navigate = useNavigate();

  const [formulario, setFormulario] =
    useState<DatosFormularioRegistro>(formularioInicial);

  const [errores, setErrores] = useState<ErroresRegistro>({});

  const [errorGeneral, setErrorGeneral] = useState("");

  const [enviando, setEnviando] = useState(false);

  const [tema, setTema] = useState<Tema>(() => {
    const temaGuardado = localStorage.getItem(TEMA_GUARDADO);

    return temaGuardado === "claro" ? "claro" : "oscuro";
  });

  useEffect(() => {
    document.documentElement.dataset.tema = tema;

    localStorage.setItem(TEMA_GUARDADO, tema);
  }, [tema]);

  function cambiarTema() {
    setTema((temaActual) => (temaActual === "oscuro" ? "claro" : "oscuro"));
  }

  function actualizarCampoGeneral(
    evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = evento.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));

    eliminarError(name);
  }

  function actualizarUsuario(
    tipoUsuario: "usuarioPrincipal" | "segundoConductor",
    evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = evento.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,

      [tipoUsuario]: {
        ...estadoAnterior[tipoUsuario],

        [name]: value,
      },
    }));

    eliminarError(`${tipoUsuario}.${name}`);
  }

  function cambiarSegundoConductor(evento: ChangeEvent<HTMLInputElement>) {
    const estaMarcado = evento.target.checked;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,

      tieneSegundoConductor: estaMarcado,

      segundoConductor: estaMarcado
        ? estadoAnterior.segundoConductor
        : {
            ...usuarioVacio,
          },
    }));

    if (!estaMarcado) {
      setErrores((erroresAnteriores) =>
        Object.fromEntries(
          Object.entries(erroresAnteriores).filter(
            ([clave]) => !clave.startsWith("segundoConductor."),
          ),
        ),
      );
    }
  }

  function actualizarCasilla(
    nombre: "haLeidoAviso" | "aceptaCondiciones",
    valor: boolean,
  ) {
    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [nombre]: valor,
    }));

    eliminarError(nombre);
  }

  function eliminarError(nombreCampo: string) {
    setErrores((erroresAnteriores) => {
      if (!erroresAnteriores[nombreCampo]) {
        return erroresAnteriores;
      }

      const erroresActualizados = {
        ...erroresAnteriores,
      };

      delete erroresActualizados[nombreCampo];

      return erroresActualizados;
    });
  }

  function validarUsuario(
    usuario: DatosUsuarioRegistro,
    prefijo: "usuarioPrincipal" | "segundoConductor",
  ): ErroresRegistro {
    const nuevosErrores: ErroresRegistro = {};

    if (!usuario.nombre.trim()) {
      nuevosErrores[`${prefijo}.nombre`] = "El nombre es obligatorio.";
    }

    if (!usuario.apellidos.trim()) {
      nuevosErrores[`${prefijo}.apellidos`] = "Los apellidos son obligatorios.";
    }

    if (!usuario.email.trim()) {
      nuevosErrores[`${prefijo}.email`] = "El email es obligatorio.";
    } else if (!validarEmail(usuario.email)) {
      nuevosErrores[`${prefijo}.email`] = "Introduce un email válido.";
    }

    if (!usuario.contrasena) {
      nuevosErrores[`${prefijo}.contrasena`] = "La contraseña es obligatoria.";
    } else if (usuario.contrasena.length < 8) {
      nuevosErrores[`${prefijo}.contrasena`] =
        "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!usuario.repetirContrasena) {
      nuevosErrores[`${prefijo}.repetirContrasena`] =
        "Debes repetir la contraseña.";
    } else if (usuario.repetirContrasena !== usuario.contrasena) {
      nuevosErrores[`${prefijo}.repetirContrasena`] =
        "Las contraseñas no coinciden.";
    }

    if (!usuario.dni.trim()) {
      nuevosErrores[`${prefijo}.dni`] = "El DNI o NIE es obligatorio.";
    } else if (!validarDocumento(usuario.dni)) {
      nuevosErrores[`${prefijo}.dni`] = "Introduce un DNI o NIE válido.";
    }

    if (!usuario.telefono.trim()) {
      nuevosErrores[`${prefijo}.telefono`] =
        "El teléfono móvil es obligatorio.";
    } else if (!validarTelefono(usuario.telefono)) {
      nuevosErrores[`${prefijo}.telefono`] =
        "Introduce un teléfono móvil válido.";
    }

    if (!usuario.filiacion) {
      nuevosErrores[`${prefijo}.filiacion`] =
        "Selecciona la filiación con el Ayuntamiento.";
    }

    return nuevosErrores;
  }

  function comprobarDatosDuplicados(nuevosErrores: ErroresRegistro) {
    const emailPrincipal = formulario.usuarioPrincipal.email
      .trim()
      .toLowerCase();

    const emailSegundo = formulario.segundoConductor.email.trim().toLowerCase();

    if (emailPrincipal && emailSegundo && emailPrincipal === emailSegundo) {
      nuevosErrores["segundoConductor.email"] =
        "El segundo conductor debe utilizar otro email.";
    }

    const dniPrincipal = normalizarDocumento(formulario.usuarioPrincipal.dni);

    const dniSegundo = normalizarDocumento(formulario.segundoConductor.dni);

    if (dniPrincipal && dniSegundo && dniPrincipal === dniSegundo) {
      nuevosErrores["segundoConductor.dni"] =
        "El segundo conductor debe tener otro DNI o NIE.";
    }
  }

  function validarFormulario(): boolean {
    let nuevosErrores: ErroresRegistro = {};

    if (!formulario.clienteId) {
      nuevosErrores.clienteId = "Selecciona un ayuntamiento u organización.";
    }

    if (!formulario.matricula.trim()) {
      nuevosErrores.matricula = "La matrícula es obligatoria.";
    } else if (!validarMatricula(formulario.matricula)) {
      nuevosErrores.matricula = "Introduce una matrícula válida.";
    }

    if (!formulario.tipoUsuario) {
      nuevosErrores.tipoUsuario = "Selecciona el tipo de usuario.";
    }

    nuevosErrores = {
      ...nuevosErrores,

      ...validarUsuario(formulario.usuarioPrincipal, "usuarioPrincipal"),
    };

    if (formulario.tieneSegundoConductor) {
      nuevosErrores = {
        ...nuevosErrores,

        ...validarUsuario(formulario.segundoConductor, "segundoConductor"),
      };

      comprobarDatosDuplicados(nuevosErrores);
    }

    if (!formulario.haLeidoAviso) {
      nuevosErrores.haLeidoAviso =
        "Debes confirmar que has leído el proceso de aprobación.";
    }

    if (!formulario.aceptaCondiciones) {
      nuevosErrores.aceptaCondiciones =
        "Debes aceptar el tratamiento de datos.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  }

  async function enviarSolicitud(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    setErrorGeneral("");

    if (!validarFormulario()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const clienteSeleccionado = clientes.find(
      (cliente) => cliente.id === formulario.clienteId,
    );

    if (!clienteSeleccionado) {
      setErrorGeneral("No se ha podido localizar la entidad seleccionada.");

      return;
    }

    try {
      setEnviando(true);

      await enviarSolicitudRegistro({
        cliente: clienteSeleccionado,

        formulario,
      });

      navigate("/panel", {
        replace: true,
      });
    } catch (error) {
      setErrorGeneral(
        error instanceof Error
          ? error.message
          : "No se ha podido enviar la solicitud. Inténtalo de nuevo.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="registro">
      <button
        type="button"
        className="registro__tema"
        onClick={cambiarTema}
        aria-label={
          tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"
        }
        title={tema === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"}
      >
        {tema === "oscuro" ? "☀" : "☾"}
      </button>

      <section className="registro__contenedor">
        <header className="registro__cabecera">
          <Link to="/login" className="registro__volver">
            ← Volver al inicio de sesión
          </Link>

          <div className="registro__marca">
            <span className="registro__icono" aria-hidden="true">
              ⚡
            </span>

            <div>
              <span className="registro__ayuntamiento">
                Servicio de recarga eléctrica
              </span>

              <strong className="registro__nombre">CargaQuer</strong>
            </div>
          </div>
        </header>

        <section className="registro__tarjeta">
          <div className="registro__titulo">
            <span>Solicitud de acceso</span>

            <h1>Registro de usuario para cargadores VE</h1>

            <p>Ayuntamiento de Quer</p>
          </div>

          <form
            className="registro__formulario"
            noValidate
            onSubmit={enviarSolicitud}
          >
            {errorGeneral && (
              <div className="registro__alerta" role="alert">
                {errorGeneral}
              </div>
            )}

            <CampoSelect
              id="clienteId"
              nombre="clienteId"
              etiqueta="Ayuntamiento u organización"
              valor={formulario.clienteId}
              textoInicial="— Selecciona tu ayuntamiento u organización —"
              opciones={clientes
                .filter((cliente) => cliente.activo)
                .map((cliente) => ({
                  valor: cliente.id,

                  texto: cliente.nombre,
                }))}
              error={errores.clienteId}
              onChange={actualizarCampoGeneral}
            />

            <fieldset className="registro__seccion">
              <legend>
                <span>1</span>
                Vehículo
              </legend>

              <div className="registro__grid">
                <CampoTexto
                  id="matricula"
                  nombre="matricula"
                  etiqueta="Matrícula"
                  valor={formulario.matricula}
                  placeholder="Ejemplo: 1234XYZ"
                  ayuda="Introduce la matrícula sin espacios ni guiones."
                  error={errores.matricula}
                  onChange={actualizarCampoGeneral}
                />

                <CampoSelect
                  id="tipoUsuario"
                  nombre="tipoUsuario"
                  etiqueta="Tipo de usuario"
                  valor={formulario.tipoUsuario}
                  error={errores.tipoUsuario}
                  onChange={actualizarCampoGeneral}
                  opciones={[
                    {
                      valor: "particular",
                      texto: "Particular",
                    },
                    {
                      valor: "empresa",
                      texto: "Empresa",
                    },
                    {
                      valor: "servicio-publico",
                      texto: "Servicio público",
                    },
                  ]}
                />
              </div>
            </fieldset>

            <fieldset className="registro__seccion">
              <legend>
                <span>2</span>
                Usuario principal
              </legend>

              <FormularioUsuario
                prefijo="principal"
                claveErrores="usuarioPrincipal"
                usuario={formulario.usuarioPrincipal}
                errores={errores}
                onChange={(evento) =>
                  actualizarUsuario("usuarioPrincipal", evento)
                }
              />
            </fieldset>

            <fieldset className="registro__seccion">
              <legend>
                <span>3</span>
                ¿Hay un segundo conductor?
              </legend>

              <label className="registro__checkbox">
                <input
                  type="checkbox"
                  checked={formulario.tieneSegundoConductor}
                  onChange={cambiarSegundoConductor}
                />

                <span>Sí, añadir un segundo usuario al mismo vehículo</span>
              </label>

              {formulario.tieneSegundoConductor && (
                <div className="registro__segundo-conductor">
                  <p className="registro__segundo-titulo">
                    Datos del segundo conductor
                  </p>

                  <FormularioUsuario
                    prefijo="segundo"
                    claveErrores="segundoConductor"
                    usuario={formulario.segundoConductor}
                    errores={errores}
                    onChange={(evento) =>
                      actualizarUsuario("segundoConductor", evento)
                    }
                  />
                </div>
              )}
            </fieldset>

            <div className="registro__aviso-pendiente" role="note">
              <span className="registro__aviso-icono" aria-hidden="true">
                ⏳
              </span>

              <div>
                <strong>Solicitud pendiente de aprobación</strong>

                <p>
                  Después de enviar tu solicitud, la administración o la entidad
                  correspondiente revisará tus datos y se te notificará por
                  correo electrónico cuando tu acceso haya sido aprobado. Si
                  transcurridas 48 horas laborables no has recibido ninguna
                  respuesta, intenta iniciar sesión. Si el acceso sigue sin
                  estar disponible, ponte en contacto con la entidad
                  correspondiente.
                </p>
              </div>
            </div>

            <div className="registro__condiciones">
              <label className="registro__checkbox">
                <input
                  type="checkbox"
                  checked={formulario.haLeidoAviso}
                  onChange={(evento) =>
                    actualizarCasilla("haLeidoAviso", evento.target.checked)
                  }
                />

                <span>
                  He leído y comprendo que la solicitud quedará pendiente de
                  aprobación.
                </span>
              </label>

              <MensajeCampo error={errores.haLeidoAviso} />
            </div>

            <div className="registro__condiciones">
              <label className="registro__checkbox">
                <input
                  type="checkbox"
                  checked={formulario.aceptaCondiciones}
                  onChange={(evento) =>
                    actualizarCasilla(
                      "aceptaCondiciones",
                      evento.target.checked,
                    )
                  }
                />

                <span>
                  Acepto el tratamiento de mis datos para gestionar el servicio
                  municipal de recarga.
                </span>
              </label>

              <MensajeCampo error={errores.aceptaCondiciones} />
            </div>

            <button
              type="submit"
              className="registro__boton"
              disabled={enviando}
            >
              {enviando ? "Enviando solicitud..." : "Enviar solicitud"}
            </button>

            <p className="registro__acceso">
              ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
          </form>
        </section>
      </section>
    </main>
  );
}

export default RegistroPage;
