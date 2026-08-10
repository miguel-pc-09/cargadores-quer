import { supabase } from "./supabaseClient";

export interface ValidacionPendiente {
  vehiculoId: string;
  usuarioId: string;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  matricula: string;
}

export interface UsuarioAdministracion {
  id: string;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  matricula: string;
  numeroCargas: number;
  energiaConsumidaKwh: number;
  estadoCuenta: "verificada" | "bloqueada";
}

export interface TomaAdministracion {
  id: string;
  cargadorId: string;
  cargadorNombre: string;
  tomaNombre: string;
  estado: string;
  potenciaMaximaKw: number;
  numeroIncidencias: number;
  tieneIncidenciaAbierta: boolean;
  cargasSemana: number;
  cargasMes: number;
  cargasAnio: number;
  energiaSuministradaKwh: number;
}

export interface IncidenciaAdministracion {
  id: string;
  cargadorId: string;
  cargadorNombre: string;
  tomaNombre: string;
  tipo: string;
  descripcion: string;
  estado: string;
  empresaSuministradora: string;
  telefonoSuministradora: string;
  empresaInstaladora: string;
  telefonoInstaladora: string;
}

interface PerfilValidacionBD {
  id: string;
  nombre: string | null;
  apellidos: string | null;
  dni: string | null;
  email: string | null;
  estado_cuenta: "pendiente" | "verificada" | "bloqueada";
}

interface VehiculoValidacionBD {
  id: string;
  usuario_id: string;
  matricula: string;
  estado_validacion: "pendiente" | "validado" | "rechazado";
  perfiles: PerfilValidacionBD | PerfilValidacionBD[] | null;
}

interface PerfilUsuarioBD {
  id: string;
  nombre: string | null;
  apellidos: string | null;
  dni: string | null;
  email: string | null;
  estado_cuenta: string;
}

interface VehiculoUsuarioBD {
  usuario_id: string;
  matricula: string | null;
}

interface CargaUsuarioBD {
  usuario_id: string;
  energia_consumida_kwh: number | string | null;
}

interface CargadorAdministracionBD {
  id: string;
  nombre: string;
  activo: boolean;
}

interface TomaAdministracionBD {
  id: string;
  cargador_id: string;
  nombre: string;
  potencia_maxima_kw: number | string | null;
  estado: string | null;
}

interface CargaAdministracionBD {
  cargador_id: string;
  toma_id: string;
  fecha_hora_inicio: string | null;
  energia_consumida_kwh: number | string | null;
}

interface IncidenciaAdministracionBD {
  id: string;
  cargador_id: string;
  toma_id: string | null;
  tipo: string | null;
  descripcion: string | null;
  estado: string | null;
}

interface CargadorIncidenciaBD {
  id: string;
  nombre: string;
  empresa_suministradora: string | null;
  telefono_suministradora: string | null;
  empresa_instaladora: string | null;
  telefono_instaladora: string | null;
}

interface TomaIncidenciaBD {
  id: string;
  nombre: string;
}

function obtenerPerfil(
  perfiles: VehiculoValidacionBD["perfiles"],
): PerfilValidacionBD | null {
  if (Array.isArray(perfiles)) {
    return perfiles[0] ?? null;
  }

  return perfiles;
}

function obtenerInicioSemana(fecha: Date) {
  const inicio = new Date(fecha);

  const dia = inicio.getDay();

  const diferencia = dia === 0 ? -6 : 1 - dia;

  inicio.setDate(inicio.getDate() + diferencia);

  inicio.setHours(0, 0, 0, 0);

  return inicio;
}

function obtenerInicioMes(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

function obtenerInicioAnio(fecha: Date) {
  return new Date(fecha.getFullYear(), 0, 1);
}

function fechaValida(fechaTexto: string | null) {
  if (!fechaTexto) {
    return null;
  }

  const fecha = new Date(fechaTexto);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  return fecha;
}

function incidenciaEstaAbierta(estado: string | null) {
  const estadoNormalizado = estado?.trim().toLowerCase() ?? "";

  return estadoNormalizado !== "resuelta" && estadoNormalizado !== "cerrada";
}

export async function obtenerValidacionesPendientes(): Promise<
  ValidacionPendiente[]
> {
  const { data, error } = await supabase
    .from("vehiculos")
    .select(
      `
        id,
        usuario_id,
        matricula,
        estado_validacion,
        perfiles (
          id,
          nombre,
          apellidos,
          dni,
          email,
          estado_cuenta
        )
      `,
    )
    .eq("estado_validacion", "pendiente");

  if (error) {
    throw new Error(
      `No se han podido cargar las validaciones: ${error.message}`,
    );
  }

  return ((data ?? []) as VehiculoValidacionBD[])
    .map((vehiculo) => {
      const perfil = obtenerPerfil(vehiculo.perfiles);

      if (!perfil) {
        return null;
      }

      return {
        vehiculoId: vehiculo.id,
        usuarioId: vehiculo.usuario_id,
        nombre: perfil.nombre?.trim() || "Sin nombre",
        apellidos: perfil.apellidos?.trim() || "",
        dni: perfil.dni?.trim() || "—",
        email: perfil.email?.trim() || "—",
        matricula: vehiculo.matricula?.trim() || "—",
      };
    })
    .filter(
      (validacion): validacion is ValidacionPendiente => validacion !== null,
    );
}

export async function aceptarValidacion(
  validacion: ValidacionPendiente,
): Promise<void> {
  const ahora = new Date().toISOString();

  const { error: errorVehiculo } = await supabase
    .from("vehiculos")
    .update({
      estado_validacion: "validado",
      motivo_rechazo: null,
      actualizado_en: ahora,
    })
    .eq("id", validacion.vehiculoId)
    .eq("usuario_id", validacion.usuarioId);

  if (errorVehiculo) {
    throw new Error(
      `No se ha podido validar el vehículo: ${errorVehiculo.message}`,
    );
  }

  const { error: errorPerfil } = await supabase
    .from("perfiles")
    .update({
      estado_cuenta: "verificada",
      actualizado_en: ahora,
    })
    .eq("id", validacion.usuarioId);

  if (errorPerfil) {
    throw new Error(
      `El vehículo se ha validado, pero no se ha podido activar la cuenta: ${errorPerfil.message}`,
    );
  }
}

export async function rechazarValidacion(
  validacion: ValidacionPendiente,
): Promise<void> {
  const ahora = new Date().toISOString();

  const { error: errorVehiculo } = await supabase
    .from("vehiculos")
    .update({
      estado_validacion: "rechazado",
      motivo_rechazo: "Validación rechazada por el Ayuntamiento.",
      actualizado_en: ahora,
    })
    .eq("id", validacion.vehiculoId)
    .eq("usuario_id", validacion.usuarioId);

  if (errorVehiculo) {
    throw new Error(
      `No se ha podido rechazar la validación: ${errorVehiculo.message}`,
    );
  }

  const { error: errorPerfil } = await supabase
    .from("perfiles")
    .update({
      estado_cuenta: "bloqueada",
      actualizado_en: ahora,
    })
    .eq("id", validacion.usuarioId);

  if (errorPerfil) {
    throw new Error(
      `La matrícula se ha rechazado, pero no se ha podido bloquear la cuenta: ${errorPerfil.message}`,
    );
  }
}

export async function obtenerUsuariosAdministracion(): Promise<
  UsuarioAdministracion[]
> {
  const [resultadoPerfiles, resultadoVehiculos, resultadoCargas] =
    await Promise.all([
      supabase
        .from("perfiles")
        .select(
          `
            id,
            nombre,
            apellidos,
            dni,
            email,
            estado_cuenta
          `,
        )
        .eq("rol", "usuario")
        .in("estado_cuenta", ["verificada", "bloqueada"])
        .order("nombre", {
          ascending: true,
        }),

      supabase.from("vehiculos").select(
        `
          usuario_id,
          matricula
        `,
      ),

      supabase.from("cargas").select(
        `
          usuario_id,
          energia_consumida_kwh
        `,
      ),
    ]);

  if (resultadoPerfiles.error) {
    throw new Error(
      `No se han podido cargar los usuarios: ${resultadoPerfiles.error.message}`,
    );
  }

  if (resultadoVehiculos.error) {
    throw new Error(
      `No se han podido cargar los vehículos: ${resultadoVehiculos.error.message}`,
    );
  }

  if (resultadoCargas.error) {
    throw new Error(
      `No se han podido cargar las cargas: ${resultadoCargas.error.message}`,
    );
  }

  const perfiles = (resultadoPerfiles.data ?? []) as PerfilUsuarioBD[];

  const vehiculos = (resultadoVehiculos.data ?? []) as VehiculoUsuarioBD[];

  const cargas = (resultadoCargas.data ?? []) as CargaUsuarioBD[];

  return perfiles.map((perfil): UsuarioAdministracion => {
    const vehiculo = vehiculos.find(
      (vehiculoActual) => vehiculoActual.usuario_id === perfil.id,
    );

    const cargasUsuario = cargas.filter(
      (carga) => carga.usuario_id === perfil.id,
    );

    const energiaConsumidaKwh = cargasUsuario.reduce((total, carga) => {
      const energia = Number(carga.energia_consumida_kwh);

      if (Number.isNaN(energia)) {
        return total;
      }

      return total + energia;
    }, 0);

    return {
      id: perfil.id,
      nombre: perfil.nombre?.trim() || "Sin nombre",
      apellidos: perfil.apellidos?.trim() || "",
      dni: perfil.dni?.trim() || "—",
      email: perfil.email?.trim() || "—",
      matricula: vehiculo?.matricula?.trim() || "—",
      numeroCargas: cargasUsuario.length,
      energiaConsumidaKwh: Number(energiaConsumidaKwh.toFixed(2)),
      estadoCuenta:
        perfil.estado_cuenta === "bloqueada" ? "bloqueada" : "verificada",
    };
  });
}

export async function bloquearUsuario(usuarioId: string): Promise<void> {
  const { error } = await supabase
    .from("perfiles")
    .update({
      estado_cuenta: "bloqueada",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", usuarioId)
    .eq("rol", "usuario");

  if (error) {
    throw new Error(`No se ha podido bloquear el usuario: ${error.message}`);
  }
}

export async function desbloquearUsuario(usuarioId: string): Promise<void> {
  const { error } = await supabase
    .from("perfiles")
    .update({
      estado_cuenta: "verificada",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", usuarioId)
    .eq("rol", "usuario");

  if (error) {
    throw new Error(`No se ha podido desbloquear el usuario: ${error.message}`);
  }
}

export async function obtenerCargadoresAdministracion(): Promise<
  TomaAdministracion[]
> {
  const [
    resultadoCargadores,
    resultadoTomas,
    resultadoCargas,
    resultadoIncidencias,
  ] = await Promise.all([
    supabase
      .from("cargadores")
      .select(
        `
          id,
          nombre,
          activo
        `,
      )
      .order("nombre", {
        ascending: true,
      }),

    supabase
      .from("tomas")
      .select(
        `
          id,
          cargador_id,
          nombre,
          potencia_maxima_kw,
          estado
        `,
      )
      .order("nombre", {
        ascending: true,
      }),

    supabase.from("cargas").select(
      `
        cargador_id,
        toma_id,
        fecha_hora_inicio,
        energia_consumida_kwh
      `,
    ),

    supabase.from("incidencias").select(
      `
        cargador_id,
        toma_id,
        estado
      `,
    ),
  ]);

  if (resultadoCargadores.error) {
    throw new Error(
      `No se han podido cargar los cargadores: ${resultadoCargadores.error.message}`,
    );
  }

  if (resultadoTomas.error) {
    throw new Error(
      `No se han podido cargar las tomas: ${resultadoTomas.error.message}`,
    );
  }

  if (resultadoCargas.error) {
    throw new Error(
      `No se han podido cargar las cargas: ${resultadoCargas.error.message}`,
    );
  }

  if (resultadoIncidencias.error) {
    throw new Error(
      `No se han podido cargar las incidencias: ${resultadoIncidencias.error.message}`,
    );
  }

  const cargadores = (resultadoCargadores.data ??
    []) as CargadorAdministracionBD[];

  const tomas = (resultadoTomas.data ?? []) as TomaAdministracionBD[];

  const cargas = (resultadoCargas.data ?? []) as CargaAdministracionBD[];

  const incidencias = (resultadoIncidencias.data ??
    []) as IncidenciaAdministracionBD[];

  const ahora = new Date();

  const inicioSemana = obtenerInicioSemana(ahora);
  const inicioMes = obtenerInicioMes(ahora);
  const inicioAnio = obtenerInicioAnio(ahora);

  return tomas
    .map((toma): TomaAdministracion | null => {
      const cargador = cargadores.find(
        (cargadorActual) => cargadorActual.id === toma.cargador_id,
      );

      if (!cargador) {
        return null;
      }

      const cargasToma = cargas.filter((carga) => carga.toma_id === toma.id);

      const incidenciasToma = incidencias.filter(
        (incidencia) =>
          incidencia.toma_id === toma.id ||
          (incidencia.toma_id === null &&
            incidencia.cargador_id === toma.cargador_id),
      );

      const cargasSemana = cargasToma.filter((carga) => {
        const fecha = fechaValida(carga.fecha_hora_inicio);

        return fecha !== null && fecha >= inicioSemana && fecha <= ahora;
      }).length;

      const cargasMes = cargasToma.filter((carga) => {
        const fecha = fechaValida(carga.fecha_hora_inicio);

        return fecha !== null && fecha >= inicioMes && fecha <= ahora;
      }).length;

      const cargasAnio = cargasToma.filter((carga) => {
        const fecha = fechaValida(carga.fecha_hora_inicio);

        return fecha !== null && fecha >= inicioAnio && fecha <= ahora;
      }).length;

      const energiaSuministradaKwh = cargasToma.reduce((total, carga) => {
        const energia = Number(carga.energia_consumida_kwh);

        if (Number.isNaN(energia)) {
          return total;
        }

        return total + energia;
      }, 0);

      return {
        id: toma.id,
        cargadorId: cargador.id,
        cargadorNombre: cargador.nombre,
        tomaNombre: toma.nombre,
        estado: cargador.activo
          ? toma.estado?.trim() || "Disponible"
          : "Inactivo",
        potenciaMaximaKw: Number(toma.potencia_maxima_kw) || 0,
        numeroIncidencias: incidenciasToma.length,
        tieneIncidenciaAbierta: incidenciasToma.some((incidencia) =>
          incidenciaEstaAbierta(incidencia.estado),
        ),
        cargasSemana,
        cargasMes,
        cargasAnio,
        energiaSuministradaKwh: Number(energiaSuministradaKwh.toFixed(2)),
      };
    })
    .filter((toma): toma is TomaAdministracion => toma !== null);
}

export async function obtenerIncidenciasAdministracion(): Promise<
  IncidenciaAdministracion[]
> {
  const [resultadoIncidencias, resultadoCargadores, resultadoTomas] =
    await Promise.all([
      supabase.from("incidencias").select(
        `
            id,
            cargador_id,
            toma_id,
            tipo,
            descripcion,
            estado
          `,
      ),

      supabase.from("cargadores").select(
        `
          id,
          nombre,
          empresa_suministradora,
          telefono_suministradora,
          empresa_instaladora,
          telefono_instaladora
        `,
      ),

      supabase.from("tomas").select(
        `
          id,
          nombre
        `,
      ),
    ]);

  if (resultadoIncidencias.error) {
    throw new Error(
      `No se han podido cargar las incidencias: ${resultadoIncidencias.error.message}`,
    );
  }

  if (resultadoCargadores.error) {
    throw new Error(
      `No se han podido cargar los cargadores: ${resultadoCargadores.error.message}`,
    );
  }

  if (resultadoTomas.error) {
    throw new Error(
      `No se han podido cargar las tomas: ${resultadoTomas.error.message}`,
    );
  }

  const incidencias = (resultadoIncidencias.data ??
    []) as IncidenciaAdministracionBD[];

  const cargadores = (resultadoCargadores.data ?? []) as CargadorIncidenciaBD[];

  const tomas = (resultadoTomas.data ?? []) as TomaIncidenciaBD[];

  return incidencias
    .filter((incidencia) => incidenciaEstaAbierta(incidencia.estado))
    .map((incidencia) => {
      const cargador = cargadores.find(
        (cargadorActual) => cargadorActual.id === incidencia.cargador_id,
      );

      const toma = incidencia.toma_id
        ? tomas.find((tomaActual) => tomaActual.id === incidencia.toma_id)
        : undefined;

      return {
        id: incidencia.id,
        cargadorId: incidencia.cargador_id,
        cargadorNombre: cargador?.nombre?.trim() || "Cargador",
        tomaNombre: toma?.nombre?.trim() || "Cargador completo",
        tipo: incidencia.tipo?.trim() || "Incidencia",
        descripcion: incidencia.descripcion?.trim() || "Sin descripción.",
        estado: incidencia.estado?.trim() || "Abierta",
        empresaSuministradora: cargador?.empresa_suministradora?.trim() || "—",
        telefonoSuministradora:
          cargador?.telefono_suministradora?.trim() || "—",
        empresaInstaladora: cargador?.empresa_instaladora?.trim() || "—",
        telefonoInstaladora: cargador?.telefono_instaladora?.trim() || "—",
      };
    });
}
