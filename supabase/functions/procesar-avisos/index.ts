import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";

const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "";

const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

interface UsuarioPendiente {
  usuario_id: string;
  nombre: string;
  apellidos: string;
  email: string;
  matricula: string;
}

interface UsuarioAprobado {
  usuario_id: string;
  nombre: string;
  apellidos: string;
  email: string;
}

interface ReservaAviso {
  reserva_id: string;
  usuario_id: string;
  email: string;
  nombre: string;
  cargador: string;
  toma: string;
  fecha: string;
  hora_inicio: string;
}

interface CargaAviso {
  carga_id: string;
  usuario_id: string;
  email: string;
  nombre: string;
  cargador: string;
  toma: string;
  fecha_hora_fin_prevista: string;
}

function escaparHtml(valor: string) {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nombreCompleto(nombre: string, apellidos = "") {
  return `${nombre} ${apellidos}`.trim() || "Usuario";
}

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);

  if (!anio || !mes || !dia) {
    return fecha;
  }

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0)));
}

function formatearHoraMadrid(fechaIso: string) {
  const fecha = new Date(fechaIso);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  }).format(fecha);
}

function plantillaCorreo(titulo: string, contenido: string) {
  return `
    <!doctype html>

    <html lang="es">

      <body
        style="
          margin: 0;
          background: #07172b;
          font-family: Arial, Helvetica, sans-serif;
          color: #f8fafc;
        "
      >

        <div
          style="
            max-width: 620px;
            margin: 0 auto;
            padding: 32px 18px;
          "
        >

          <div
            style="
              background: #0d2340;
              border: 1px solid #24405f;
              border-radius: 16px;
              padding: 28px;
            "
          >

            <div
              style="
                font-size: 20px;
                font-weight: 800;
                margin-bottom: 4px;
              "
            >
              ⚡ CargaQuer
            </div>

            <div
              style="
                color: #6ee7b7;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.08em;
                margin-bottom: 26px;
              "
            >
              CARGA ELÉCTRICA MUNICIPAL ·
              AYUNTAMIENTO DE QUER
            </div>

            <h1
              style="
                font-size: 24px;
                line-height: 1.25;
                margin: 0 0 18px;
              "
            >
              ${titulo}
            </h1>

            <div
              style="
                color: #cbd5e1;
                font-size: 15px;
                line-height: 1.65;
              "
            >
              ${contenido}
            </div>

          </div>

          <p
            style="
              color: #7f93ab;
              font-size: 12px;
              text-align: center;
              margin: 18px 0 0;
            "
          >
            Este es un aviso automático
            de CargaQuer.
          </p>

        </div>

      </body>

    </html>
  `;
}

async function enviarCorreo(
  destinatario: string,
  asunto: string,
  html: string,
) {
  const respuesta = await fetch("https://api.resend.com/emails", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      Authorization: `Bearer ${RESEND_API_KEY}`,
    },

    body: JSON.stringify({
      from: EMAIL_FROM,

      to: [destinatario],

      subject: asunto,

      html,
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();

    throw new Error(`Resend ${respuesta.status}: ${detalle}`);
  }
}

async function guardarResultado(
  tipo: string,
  referenciaId: string,
  destinatario: string,
  estado: "enviado" | "error",
  detalle?: Record<string, unknown>,
) {
  const { error } = await supabase.from("avisos_email").upsert(
    {
      tipo,

      referencia_id: referenciaId,

      destinatario,

      estado,

      detalle: detalle ?? null,

      enviado_en: new Date().toISOString(),
    },
    {
      onConflict: "tipo,referencia_id,destinatario",
    },
  );

  if (error) {
    console.error("No se ha podido guardar el estado del aviso:", error);
  }
}

async function procesarCorreo(
  tipo: string,
  referenciaId: string,
  destinatario: string,
  asunto: string,
  html: string,
  detalle?: Record<string, unknown>,
) {
  try {
    await enviarCorreo(destinatario, asunto, html);

    await guardarResultado(
      tipo,
      referenciaId,
      destinatario,
      "enviado",
      detalle,
    );

    return true;
  } catch (error) {
    console.error(`Error enviando ${tipo} a ${destinatario}:`, error);

    await guardarResultado(tipo, referenciaId, destinatario, "error", {
      ...detalle,

      error: error instanceof Error ? error.message : String(error),
    });

    return false;
  }
}

async function obtenerRpc<T>(nombre: string): Promise<T[]> {
  const { data, error } = await supabase.rpc(nombre);

  if (error) {
    throw new Error(`${nombre}: ${error.message}`);
  }

  return (data ?? []) as T[];
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Método no permitido", {
      status: 405,
    });
  }

  if (!CRON_SECRET || request.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("No autorizado", {
      status: 401,
    });
  }

  if (
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !RESEND_API_KEY ||
    !ADMIN_EMAIL ||
    !EMAIL_FROM
  ) {
    return Response.json(
      {
        error: "Faltan secretos obligatorios de la Edge Function.",
      },
      {
        status: 500,
      },
    );
  }

  const resultado = {
    reservasCaducadas: 0,

    nuevosUsuarios: 0,

    accesosAprobados: 0,

    avisosReserva: 0,

    avisosFinCarga: 0,

    errores: 0,
  };

  try {
    const { data: totalCaducadas, error: errorCaducidad } = await supabase.rpc(
      "cargaquer_caducar_reservas_no_iniciadas",
    );

    if (errorCaducidad) {
      throw new Error(errorCaducidad.message);
    }

    resultado.reservasCaducadas = Number(totalCaducadas) || 0;

    const pendientes = await obtenerRpc<UsuarioPendiente>(
      "cargaquer_usuarios_pendientes_aviso",
    );

    for (const usuario of pendientes) {
      const nombre = escaparHtml(
        nombreCompleto(usuario.nombre, usuario.apellidos),
      );

      const email = escaparHtml(usuario.email);

      const matricula = escaparHtml(usuario.matricula || "No indicada");

      const enviado = await procesarCorreo(
        "nuevo_usuario_admin",

        usuario.usuario_id,

        ADMIN_EMAIL,

        "CargaQuer · Nuevo usuario pendiente de aprobación",

        plantillaCorreo(
          "Nuevo usuario pendiente de aprobación",

          `
              <p>
                Se ha registrado un nuevo
                usuario en CargaQuer.
              </p>

              <p>
                <strong>Usuario:</strong>
                ${nombre}<br>

                <strong>Correo:</strong>
                ${email}<br>

                <strong>Matrícula:</strong>
                ${matricula}
              </p>

              <p>
                Entra en el panel de
                administración de CargaQuer
                para revisar y aceptar o
                rechazar su solicitud.
              </p>
            `,
        ),

        {
          usuario_email: usuario.email,

          matricula: usuario.matricula,
        },
      );

      if (enviado) {
        resultado.nuevosUsuarios++;
      } else {
        resultado.errores++;
      }
    }

    const aprobados = await obtenerRpc<UsuarioAprobado>(
      "cargaquer_usuarios_aprobados_aviso",
    );

    for (const usuario of aprobados) {
      const nombre = escaparHtml(usuario.nombre || "Usuario");

      const enviado = await procesarCorreo(
        "acceso_aprobado",

        usuario.usuario_id,

        usuario.email,

        "CargaQuer · Tu acceso ha sido aprobado",

        plantillaCorreo(
          "Tu acceso a CargaQuer ha sido aprobado",

          `
              <p>
                Hola ${nombre},
              </p>

              <p>
                El Ayuntamiento de Quer
                ha aprobado tu solicitud.
              </p>

              <p>
                Ya puedes iniciar sesión
                en CargaQuer y utilizar el
                servicio de reservas y
                carga eléctrica municipal.
              </p>
            `,
        ),
      );

      if (enviado) {
        resultado.accesosAprobados++;
      } else {
        resultado.errores++;
      }
    }

    const reservas = await obtenerRpc<ReservaAviso>(
      "cargaquer_reservas_aviso_inicio",
    );

    for (const reserva of reservas) {
      const nombre = escaparHtml(reserva.nombre || "Usuario");

      const cargador = escaparHtml(reserva.cargador);

      const toma = escaparHtml(reserva.toma);

      const fecha = escaparHtml(formatearFecha(reserva.fecha));

      const hora = escaparHtml(reserva.hora_inicio);

      const enviado = await procesarCorreo(
        "reserva_15_min",

        reserva.reserva_id,

        reserva.email,

        "CargaQuer · Tu reserva comienza en 15 minutos",

        plantillaCorreo(
          "Tu reserva comienza en 15 minutos",

          `
              <p>
                Hola ${nombre},
              </p>

              <p>
                Tu reserva de carga
                comenzará aproximadamente
                dentro de 15 minutos.
              </p>

              <p>
                <strong>Cargador:</strong>
                ${cargador}<br>

                <strong>Toma:</strong>
                ${toma}<br>

                <strong>Fecha:</strong>
                ${fecha}<br>

                <strong>Hora:</strong>
                ${hora}
              </p>

              <p>
                Recuerda que dispones de
                <strong>
                  15 minutos desde la hora
                  de inicio
                </strong>
                para comenzar la carga.

                Si no la inicias en ese
                plazo, la reserva se
                liberará automáticamente.
              </p>
            `,
        ),
      );

      if (enviado) {
        resultado.avisosReserva++;
      } else {
        resultado.errores++;
      }
    }

    const cargas = await obtenerRpc<CargaAviso>("cargaquer_cargas_aviso_fin");

    for (const carga of cargas) {
      const nombre = escaparHtml(carga.nombre || "Usuario");

      const cargador = escaparHtml(carga.cargador);

      const toma = escaparHtml(carga.toma);

      const horaFin = escaparHtml(
        formatearHoraMadrid(carga.fecha_hora_fin_prevista),
      );

      const enviado = await procesarCorreo(
        "carga_fin_15_min",

        carga.carga_id,

        carga.email,

        "CargaQuer · Tu carga finalizará en 15 minutos",

        plantillaCorreo(
          "Tu carga finalizará en 15 minutos",

          `
              <p>
                Hola ${nombre},
              </p>

              <p>
                Tu sesión de carga está
                próxima a finalizar.
              </p>

              <p>
                <strong>Cargador:</strong>
                ${cargador}<br>

                <strong>Toma:</strong>
                ${toma}<br>

                <strong>
                  Fin previsto:
                </strong>
                ${horaFin}
              </p>

              <p>
                Te recomendamos que estés
                pendiente para retirar el
                vehículo cuando termine
                la sesión.
              </p>
            `,
        ),
      );

      if (enviado) {
        resultado.avisosFinCarga++;
      } else {
        resultado.errores++;
      }
    }

    return Response.json({
      ok: true,

      ...resultado,
    });
  } catch (error) {
    console.error("Error general procesando avisos:", error);

    return Response.json(
      {
        ok: false,

        ...resultado,

        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      },
    );
  }
});
