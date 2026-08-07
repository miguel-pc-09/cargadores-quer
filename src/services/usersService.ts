import type {
  DatosVehiculo,
  EstadoValidacionVehiculo,
  TipoVehiculo,
} from "../types/user";

export const CLAVE_VEHICULO_USUARIO = "cargaquer_perfil_vehiculo";

export const VEHICULO_INICIAL: DatosVehiculo = {
  marcaModelo: "Hyundai Kona Eléctrico",
  matricula: "0000 AAA",
  tipo: "electrico",
  estadoValidacion: "validado",
};

function esTipoVehiculoValido(tipo: unknown): tipo is TipoVehiculo {
  return tipo === "electrico" || tipo === "hibrido-enchufable";
}

function esEstadoValidacionValido(
  estado: unknown,
): estado is EstadoValidacionVehiculo {
  return (
    estado === "validado" || estado === "pendiente" || estado === "rechazado"
  );
}

export function obtenerVehiculoUsuario(): DatosVehiculo {
  try {
    const vehiculoGuardado = localStorage.getItem(CLAVE_VEHICULO_USUARIO);

    if (!vehiculoGuardado) {
      return {
        ...VEHICULO_INICIAL,
      };
    }

    const datosGuardados = JSON.parse(
      vehiculoGuardado,
    ) as Partial<DatosVehiculo>;

    return {
      marcaModelo:
        typeof datosGuardados.marcaModelo === "string" &&
        datosGuardados.marcaModelo.trim()
          ? datosGuardados.marcaModelo
          : VEHICULO_INICIAL.marcaModelo,

      matricula:
        typeof datosGuardados.matricula === "string" &&
        datosGuardados.matricula.trim()
          ? datosGuardados.matricula
          : VEHICULO_INICIAL.matricula,

      tipo: esTipoVehiculoValido(datosGuardados.tipo)
        ? datosGuardados.tipo
        : VEHICULO_INICIAL.tipo,

      estadoValidacion: esEstadoValidacionValido(
        datosGuardados.estadoValidacion,
      )
        ? datosGuardados.estadoValidacion
        : VEHICULO_INICIAL.estadoValidacion,
    };
  } catch {
    return {
      ...VEHICULO_INICIAL,
    };
  }
}

export function guardarVehiculoUsuario(vehiculo: DatosVehiculo): void {
  localStorage.setItem(CLAVE_VEHICULO_USUARIO, JSON.stringify(vehiculo));
}

export function vehiculoEstaValidado(): boolean {
  return obtenerVehiculoUsuario().estadoValidacion === "validado";
}

export function vehiculoEstaPendiente(): boolean {
  return obtenerVehiculoUsuario().estadoValidacion === "pendiente";
}

export function vehiculoEstaRechazado(): boolean {
  return obtenerVehiculoUsuario().estadoValidacion === "rechazado";
}

export function puedeUsuarioIniciarCarga(): boolean {
  return vehiculoEstaValidado();
}

export function validarVehiculoUsuario(): DatosVehiculo {
  const vehiculoActual = obtenerVehiculoUsuario();

  const vehiculoValidado: DatosVehiculo = {
    ...vehiculoActual,
    estadoValidacion: "validado",
  };

  guardarVehiculoUsuario(vehiculoValidado);

  return vehiculoValidado;
}

export function rechazarVehiculoUsuario(): DatosVehiculo {
  const vehiculoActual = obtenerVehiculoUsuario();

  const vehiculoRechazado: DatosVehiculo = {
    ...vehiculoActual,
    estadoValidacion: "rechazado",
  };

  guardarVehiculoUsuario(vehiculoRechazado);

  return vehiculoRechazado;
}
