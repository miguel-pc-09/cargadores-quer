import { supabase } from "./supabaseClient";

// Datos de un usuario en administración.
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

// Datos de una toma en administración.
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

// Datos de una incidencia en administración.
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

// Datos de un movimiento reciente.
export interface MovimientoAdministracion {
  id: string;
  fecha: string;
  usuario: string;
  accion: string;
  cargador: string;
  estado: "correcto" | "pendiente" | "incidencia";
}

// Datos del resumen de administración.
export interface ResumenAdministracion {
  usuariosRegistrados: number;
  usuariosActivos: number;
  cargasRealizadas: number;
  energiaSuministradaKwh: number;
  validacionesPendientes: number;
  incidenciasAbiertas: number;
  cargadores: number;
  tomas: number;
  movimientos: MovimientoAdministracion[];
}

// Perfil de usuario en la base de datos.
interface PerfilUsuarioBD {
  id: string;
  nombre: string | null;
  apellidos: string | null;
  dni: string | null;
  email: string | null;
  estado_cuenta: string;
}

// Vehículo de usuario en la base de datos.
interface VehiculoUsuarioBD {
  usuario_id: string;
  matricula: string | null;
}

// Carga de usuario en la base de datos.
interface CargaUsuarioBD {
  usuario_id: string;
  energia_consumida_kwh: number | string | null;
}

// Cargador en la base de datos.
interface CargadorBD {
  id: string;
  nombre: string;
  activo: boolean;
}

// Toma en la base de datos.
interface TomaBD {
  id: string;
  cargador_id: string;
  nombre: string;
  potencia_maxima_kw: number | string | null;
  estado: string | null;
}

// Carga usada para estadísticas.
interface CargaBD {
  cargador_id: string;
  toma_id: string;
  fecha_hora_inicio: string | null;
  energia_consumida_kwh: number | string | null;
}

// Incidencia en la base de datos.
interface IncidenciaBD {
  id: string;
  cargador_id: string;
  toma_id: string | null;
  tipo: string | null;
  descripcion: string | null;
  estado: string | null;
}

// Datos del cargador para incidencias.
interface CargadorIncidenciaBD {
  id: string;
  nombre: string;
  empresa_suministradora: string | null;
  telefono_suministradora: string | null;
  empresa_instaladora: string | null;
  telefono_instaladora: string | null;
}

// Datos de la toma para incidencias.
interface TomaIncidenciaBD {
  id: string;
  nombre: string;
}

// Prefijo para los datos de demostración.
const DEMO = "demo-admin-";

// Usuarios de demostración.
const DEMO_USUARIOS: UsuarioAdministracion[] = [
  [
    "1",
    "Laura",
    "García Martín",
    "12345678A",
    "laura.garcia@demo.cargaquer.es",
    "1234LGM",
    14,
    82.46,
    "verificada",
  ],
  [
    "2",
    "Javier",
    "Sánchez López",
    "23456789B",
    "javier.sanchez@demo.cargaquer.es",
    "5678JSL",
    9,
    61.2,
    "verificada",
  ],
  [
    "3",
    "Ana",
    "Martínez Pérez",
    "34567890C",
    "ana.martinez@demo.cargaquer.es",
    "9012AMP",
    21,
    143.74,
    "verificada",
  ],
  [
    "4",
    "Carlos",
    "Ruiz Gómez",
    "45678901D",
    "carlos.ruiz@demo.cargaquer.es",
    "3456CRG",
    7,
    48.91,
    "verificada",
  ],
  [
    "5",
    "Marta",
    "Fernández Díaz",
    "56789012E",
    "marta.fernandez@demo.cargaquer.es",
    "7890MFD",
    18,
    112.37,
    "verificada",
  ],
  [
    "6",
    "David",
    "Moreno Castro",
    "67890123F",
    "david.moreno@demo.cargaquer.es",
    "2468DMC",
    11,
    76.55,
    "verificada",
  ],
  [
    "7",
    "Elena",
    "Navarro Ruiz",
    "78901234G",
    "elena.navarro@demo.cargaquer.es",
    "1357ENR",
    13,
    91.08,
    "bloqueada",
  ],
  [
    "8",
    "Miguel",
    "Torres Vega",
    "89012345H",
    "miguel.torres@demo.cargaquer.es",
    "8024MTV",
    16,
    105.69,
    "verificada",
  ],
].map(
  ([
    id,
    nombre,
    apellidos,
    dni,
    email,
    matricula,
    cargas,
    energia,
    estado,
  ]) => ({
    id: DEMO + "usuario-" + id,
    nombre: nombre as string,
    apellidos: apellidos as string,
    dni: dni as string,
    email: email as string,
    matricula: matricula as string,
    numeroCargas: cargas as number,
    energiaConsumidaKwh: energia as number,
    estadoCuenta: estado as "verificada" | "bloqueada",
  }),
);

// Tomas de demostración.
const DEMO_TOMAS: TomaAdministracion[] = [
  ["1", "Enebros", "Toma 1", "libre", 22, 0, false, 18, 76, 384, 842.35],
  ["2", "Enebros", "Toma 2", "ocupada", 22, 1, true, 22, 91, 421, 931.72],
  [
    "3",
    "Centro Cultural",
    "Toma 1",
    "reservada",
    11,
    0,
    false,
    13,
    58,
    277,
    502.41,
  ],
  [
    "4",
    "Centro Cultural",
    "Toma 2",
    "libre",
    11,
    0,
    false,
    11,
    47,
    239,
    421.88,
  ],
  [
    "5",
    "Piscina",
    "Toma 1",
    "fuera de servicio",
    22,
    2,
    true,
    3,
    21,
    167,
    318.42,
  ],
  ["6", "Piscina", "Toma 2", "libre", 22, 0, false, 9, 39, 198, 392.17],
  ["7", "Ayuntamiento", "Toma 1", "libre", 7.4, 0, false, 6, 24, 121, 184.63],
].map(
  ([
    id,
    cargadorNombre,
    tomaNombre,
    estado,
    potencia,
    numeroIncidencias,
    tieneIncidenciaAbierta,
    cargasSemana,
    cargasMes,
    cargasAnio,
    energia,
  ]) => ({
    id: DEMO + "toma-" + id,
    cargadorId:
      DEMO +
      "cargador-" +
      (id === "1" || id === "2"
        ? "1"
        : id === "3" || id === "4"
          ? "2"
          : id === "5" || id === "6"
            ? "3"
            : "4"),
    cargadorNombre: cargadorNombre as string,
    tomaNombre: tomaNombre as string,
    estado: estado as string,
    potenciaMaximaKw: potencia as number,
    numeroIncidencias: numeroIncidencias as number,
    tieneIncidenciaAbierta: tieneIncidenciaAbierta as boolean,
    cargasSemana: cargasSemana as number,
    cargasMes: cargasMes as number,
    cargasAnio: cargasAnio as number,
    energiaSuministradaKwh: energia as number,
  }),
);

// Incidencias de demostración.
const DEMO_INCIDENCIAS: IncidenciaAdministracion[] = [
  {
    id: DEMO + "incidencia-1",
    cargadorId: DEMO + "cargador-1",
    cargadorNombre: "Enebros",
    tomaNombre: "Toma 2",
    tipo: "Error de comunicación",
    descripcion:
      "La toma ha perdido comunicación con el sistema de gestión y requiere comprobación remota.",
    estado: "Abierta",
    empresaSuministradora: "Iberdrola Smart Charging",
    telefonoSuministradora: "900 123 456",
    empresaInstaladora: "ElectroQuer Servicios",
    telefonoInstaladora: "949 000 111",
  },
  {
    id: DEMO + "incidencia-2",
    cargadorId: DEMO + "cargador-3",
    cargadorNombre: "Piscina",
    tomaNombre: "Toma 1",
    tipo: "Toma fuera de servicio",
    descripcion:
      "La toma se ha puesto fuera de servicio después de detectar una anomalía durante una sesión.",
    estado: "En revisión",
    empresaSuministradora: "Endesa X Way",
    telefonoSuministradora: "900 456 789",
    empresaInstaladora: "ElectroQuer Servicios",
    telefonoInstaladora: "949 000 111",
  },
  {
    id: DEMO + "incidencia-3",
    cargadorId: DEMO + "cargador-3",
    cargadorNombre: "Piscina",
    tomaNombre: "Cargador completo",
    tipo: "Mantenimiento preventivo",
    descripcion:
      "Se ha programado una revisión preventiva del equipo por acumulación de avisos de mantenimiento.",
    estado: "Abierta",
    empresaSuministradora: "Endesa X Way",
    telefonoSuministradora: "900 456 789",
    empresaInstaladora: "ElectroQuer Servicios",
    telefonoInstaladora: "949 000 111",
  },
];

// Movimientos de demostración.
const DEMO_MOVIMIENTOS: MovimientoAdministracion[] = [
  [
    "1",
    "16/08/2026, 08:42",
    "Ana Martínez",
    "Carga finalizada",
    "Centro Cultural",
    "correcto",
  ],
  [
    "2",
    "16/08/2026, 08:15",
    "Laura García",
    "Nueva reserva",
    "Enebros",
    "correcto",
  ],
  [
    "3",
    "16/08/2026, 07:51",
    "Javier Sánchez",
    "Cambio de vehículo",
    "—",
    "pendiente",
  ],
  [
    "4",
    "15/08/2026, 22:34",
    "Sistema",
    "Incidencia registrada",
    "Piscina",
    "incidencia",
  ],
  [
    "5",
    "15/08/2026, 19:20",
    "Miguel Torres",
    "Carga finalizada",
    "Enebros",
    "correcto",
  ],
].map(([id, fecha, usuario, accion, cargador, estado]) => ({
  id: DEMO + "movimiento-" + id,
  fecha: fecha as string,
  usuario: usuario as string,
  accion: accion as string,
  cargador: cargador as string,
  estado: estado as "correcto" | "pendiente" | "incidencia",
}));

// Comprueba si un dato es de demostración.
const esDemo = (id: string) => id.startsWith(DEMO);

// Convierte un texto en fecha.
const obtenerFecha = (texto: string | null) => (texto ? new Date(texto) : null);

// Comprueba si una incidencia sigue abierta.
const incidenciaAbierta = (estado: string | null) => {
  const normalizado = estado?.trim().toLowerCase() ?? "";

  return normalizado !== "resuelta" && normalizado !== "cerrada";
};

// Calcula el inicio de la semana.
const obtenerInicioSemana = (fecha: Date) => {
  const inicio = new Date(fecha);

  const dia = inicio.getDay();

  inicio.setDate(inicio.getDate() + (dia === 0 ? -6 : 1 - dia));

  inicio.setHours(0, 0, 0, 0);

  return inicio;
};

// Obtiene los usuarios de administración.
export async function obtenerUsuariosAdministracion(): Promise<
  UsuarioAdministracion[]
> {
  const [resultadoPerfiles, resultadoVehiculos, resultadoCargas] =
    await Promise.all([
      supabase
        .from("perfiles")
        .select("id,nombre,apellidos,dni,email,estado_cuenta")
        .eq("rol", "usuario")
        .order("nombre", { ascending: true }),

      supabase
        .from("vehiculos")
        .select("usuario_id,matricula")
        .order("creado_en", { ascending: true }),

      supabase.from("cargas").select("usuario_id,energia_consumida_kwh"),
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

  // Prepara los datos de cada usuario.
  const resultado: UsuarioAdministracion[] = perfiles.map((perfil) => {
    const vehiculo = vehiculos.find(
      (actual) => actual.usuario_id === perfil.id,
    );

    const cargasUsuario = cargas.filter(
      (carga) => carga.usuario_id === perfil.id,
    );

    const energia = cargasUsuario.reduce((total, carga) => {
      const valor = Number(carga.energia_consumida_kwh);

      return Number.isNaN(valor) ? total : total + valor;
    }, 0);

    return {
      id: perfil.id,
      nombre: perfil.nombre?.trim() || "Sin nombre",
      apellidos: perfil.apellidos?.trim() || "",
      dni: perfil.dni?.trim() || "—",
      email: perfil.email?.trim() || "—",
      matricula: vehiculo?.matricula?.trim() || "—",
      numeroCargas: cargasUsuario.length,
      energiaConsumidaKwh: Number(energia.toFixed(2)),
      estadoCuenta:
        perfil.estado_cuenta === "bloqueada" ? "bloqueada" : "verificada",
    };
  });

  return resultado.length ? resultado : [...DEMO_USUARIOS];
}

// Bloquea un usuario.
export async function bloquearUsuario(usuarioId: string): Promise<void> {
  if (esDemo(usuarioId)) {
    return;
  }

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

// Desbloquea un usuario.
export async function desbloquearUsuario(usuarioId: string): Promise<void> {
  if (esDemo(usuarioId)) {
    return;
  }

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

// Obtiene los cargadores de administración.
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
      .select("id,nombre,activo")
      .order("nombre", { ascending: true }),

    supabase
      .from("tomas")
      .select("id,cargador_id,nombre,potencia_maxima_kw,estado")
      .order("nombre", { ascending: true }),

    supabase
      .from("cargas")
      .select("cargador_id,toma_id,fecha_hora_inicio,energia_consumida_kwh"),

    supabase.from("incidencias").select("cargador_id,toma_id,estado"),
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

  const cargadores = (resultadoCargadores.data ?? []) as CargadorBD[];

  const tomas = (resultadoTomas.data ?? []) as TomaBD[];

  const cargas = (resultadoCargas.data ?? []) as CargaBD[];

  const incidencias = (resultadoIncidencias.data ?? []) as IncidenciaBD[];

  if (!tomas.length) {
    return [...DEMO_TOMAS];
  }

  const ahora = new Date();

  const semana = obtenerInicioSemana(ahora);

  const mes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const anio = new Date(ahora.getFullYear(), 0, 1);

  // Prepara los datos de cada toma.
  return tomas
    .map((toma) => {
      const cargador = cargadores.find(
        (actual) => actual.id === toma.cargador_id,
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

      // Cuenta las cargas desde una fecha.
      const contar = (inicio: Date) =>
        cargasToma.filter((carga) => {
          const fecha = obtenerFecha(carga.fecha_hora_inicio);

          return (
            fecha !== null &&
            !Number.isNaN(fecha.getTime()) &&
            fecha >= inicio &&
            fecha <= ahora
          );
        }).length;

      // Calcula la energía suministrada.
      const energia = cargasToma.reduce((total, carga) => {
        const valor = Number(carga.energia_consumida_kwh);

        return Number.isNaN(valor) ? total : total + valor;
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
          incidenciaAbierta(incidencia.estado),
        ),
        cargasSemana: contar(semana),
        cargasMes: contar(mes),
        cargasAnio: contar(anio),
        energiaSuministradaKwh: Number(energia.toFixed(2)),
      };
    })
    .filter((toma): toma is TomaAdministracion => toma !== null);
}

// Obtiene las incidencias de administración.
export async function obtenerIncidenciasAdministracion(): Promise<
  IncidenciaAdministracion[]
> {
  const [resultadoIncidencias, resultadoCargadores, resultadoTomas] =
    await Promise.all([
      supabase
        .from("incidencias")
        .select("id,cargador_id,toma_id,tipo,descripcion,estado"),

      supabase
        .from("cargadores")
        .select(
          "id,nombre,empresa_suministradora,telefono_suministradora,empresa_instaladora,telefono_instaladora",
        ),

      supabase.from("tomas").select("id,nombre"),
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

  const incidencias = (resultadoIncidencias.data ?? []) as IncidenciaBD[];

  if (!incidencias.length) {
    return [...DEMO_INCIDENCIAS];
  }

  const cargadores = (resultadoCargadores.data ?? []) as CargadorIncidenciaBD[];

  const tomas = (resultadoTomas.data ?? []) as TomaIncidenciaBD[];

  // Prepara las incidencias abiertas.
  return incidencias
    .filter((incidencia) => incidenciaAbierta(incidencia.estado))
    .map((incidencia) => {
      const cargador = cargadores.find(
        (actual) => actual.id === incidencia.cargador_id,
      );

      const toma = incidencia.toma_id
        ? tomas.find((actual) => actual.id === incidencia.toma_id)
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

// Obtiene el resumen de administración.
export async function obtenerResumenAdministracion(): Promise<ResumenAdministracion> {
  const [usuarios, tomas, incidencias] = await Promise.all([
    obtenerUsuariosAdministracion(),
    obtenerCargadoresAdministracion(),
    obtenerIncidenciasAdministracion(),
  ]);

  // Calcula la energía total.
  const energia = usuarios.reduce(
    (total, usuario) => total + usuario.energiaConsumidaKwh,
    0,
  );

  // Calcula el número de cargas.
  const cargas = usuarios.reduce(
    (total, usuario) => total + usuario.numeroCargas,
    0,
  );

  // Calcula los usuarios activos.
  const activos = usuarios.filter(
    (usuario) => usuario.estadoCuenta === "verificada",
  ).length;

  // Calcula el número de cargadores.
  const cargadores = new Set(tomas.map((toma) => toma.cargadorId)).size;

  return {
    usuariosRegistrados: usuarios.length,
    usuariosActivos: activos,
    cargasRealizadas: cargas,
    energiaSuministradaKwh: Number(energia.toFixed(2)),
    validacionesPendientes: 0,
    incidenciasAbiertas: incidencias.length,
    cargadores,
    tomas: tomas.length,
    movimientos: [...DEMO_MOVIMIENTOS],
  };
}
