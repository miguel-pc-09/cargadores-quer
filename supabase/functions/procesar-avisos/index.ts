import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "";

const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,

    autoRefreshToken: false,
  },
});

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

function plantillaCorreo(titulo: string, contenido: string) {
  return `
    <!doctype html>

    <html lang="es">

      <body
        style="
          margin:0;
          background:#07172b;
          font-family:Arial,Helvetica,sans-serif;
          color:#f8fafc;
        "
      >

        <div
          style="
            max-width:620px;
            margin:0 auto;
            padding:32px 18px;
          "
        >

          <div
            style="
              background:#0d2340;
              border:1px solid #24405f;
              border-radius:16px;
              padding:28px;
            "
          >

            <div
              style="
                font-size:20px;
                font-weight:800;
                margin-bottom:4px;
              "
            >
              ⚡ CargaQuer
            </div>

            <div
              style="
                color:#6ee7b7;
                font-size:12px;
                font-weight:700;
                letter-spacing:.08em;
                margin-bottom:26px;
              "
            >
              CARGA ELÉCTRICA MUNICIPAL · AYUNTAMIENTO DE QUER
            </div>

            <h1
              style="
                font-size:24px;
                line-height:1.25;
                margin:0 0 18px;
              "
            >
              ${titulo}
            </h1>

            <div
              style="
                color:#cbd5e1;
                font-size:15px;
                line-height:1.65;
              "
            >
              ${contenido}
            </div>

          </div>

          <p
            style="
              color:#7f93ab;
              font-size:12px;
              text-align:center;
              margin:18px 0 0;
            "
          >
            Este es un aviso automático de CargaQuer.
          </p>

        </div>

      </body>

    </html>
  `;
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

async function llamadaDeAdministradorAutenticado(request: Request) {
  const autorizacion = request.headers.get("authorization");

  if (!autorizacion?.toLowerCase().startsWith("bearer ")) {
    return false;
  }

  const token = autorizacion.slice(7).trim();

  if (!token) {
    return false;
  }

  const {
    data: { user },

    error: errorUsuario,
  } = await supabase.auth.getUser(token);

  if (errorUsuario || !user) {
    return false;
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  if (errorPerfil || !perfil) {
    return false;
  }

  return perfil.rol === "administrador";
}

async function avisoYaEnviado(
  tipo: string,
  referenciaId: string,
  destinatario: string,
) {
  const { data, error } = await supabase
    .from("avisos_email")
    .select("id")
    .eq("tipo", tipo)
    .eq("referencia_id", referenciaId)
    .eq("destinatario", destinatario)
    .eq("estado", "enviado")
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido comprobar el aviso: ${error.message}`);
  }

  return Boolean(data);
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
) {
  if (await avisoYaEnviado(tipo, referenciaId, destinatario)) {
    return false;
  }

  try {
    await enviarCorreo(destinatario, asunto, html);

    await guardarResultado(tipo, referenciaId, destinatario, "enviado");

    return true;
  } catch (error) {
    await guardarResultado(tipo, referenciaId, destinatario, "error", {
      error: error instanceof Error ? error.message : String(error),
    });

    console.error(`Error enviando ${tipo} a ${destinatario}:`, error);

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
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return new Response("Método no permitido", {
      status: 405,

      headers: corsHeaders,
    });
  }

  if (
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !RESEND_API_KEY ||
    !EMAIL_FROM
  ) {
    return Response.json(
      {
        error: "Faltan secretos obligatorios de la Edge Function.",
      },
      {
        status: 500,

        headers: corsHeaders,
      },
    );
  }

  const llamadaCron =
    Boolean(CRON_SECRET) &&
    request.headers.get("x-cron-secret") === CRON_SECRET;

  const llamadaAdministrador = llamadaCron
    ? false
    : await llamadaDeAdministradorAutenticado(request);

  if (!llamadaCron && !llamadaAdministrador) {
    return new Response("No autorizado", {
      status: 401,

      headers: corsHeaders,
    });
  }

  const resultado = {
    reservasCaducadas: 0,

    accesosAprobados: 0,

    avisosReserva: 0,

    avisosFinCarga: 0,

    errores: 0,
  };

  try {
    const aprobados = await obtenerRpc<UsuarioAprobado>(
      "cargaquer_usuarios_aprobados_aviso",
    );

    for (const usuario of aprobados) {
      const enviado = await procesarCorreo(
        "acceso_aprobado",

        usuario.usuario_id,

        usuario.email,

        "CargaQuer · Tu acceso ha sido aprobado",

        plantillaCorreo(
          "Tu acceso a CargaQuer ha sido aprobado",

          `
            <p>
              Hola ${escaparHtml(usuario.nombre || "Usuario")},
            </p>

            <p>
              El Ayuntamiento de Quer ha aprobado tu solicitud.
            </p>

            <p>
              Ya puedes iniciar sesión en CargaQuer y utilizar el servicio
              de reservas y carga eléctrica municipal.
            </p>
          `,
        ),
      );

      if (enviado) {
        resultado.accesosAprobados++;
      }
    }

    if (llamadaCron) {
      const { data: totalCaducadas, error: errorCaducidad } =
        await supabase.rpc("cargaquer_caducar_reservas_no_iniciadas");

      if (errorCaducidad) {
        throw new Error(errorCaducidad.message);
      }

      resultado.reservasCaducadas = Number(totalCaducadas) || 0;

      const reservas = await obtenerRpc<ReservaAviso>(
        "cargaquer_reservas_aviso_inicio",
      );

      for (const reserva of reservas) {
        const enviado = await procesarCorreo(
          "reserva_15_min",

          reserva.reserva_id,

          reserva.email,

          "CargaQuer · Tu reserva comienza en 15 minutos",

          plantillaCorreo(
            "Tu reserva comienza en 15 minutos",

            `
              <p>
                Hola ${escaparHtml(reserva.nombre || "Usuario")},
              </p>

              <p>
                Tu reserva de carga comenzará aproximadamente dentro de
                15 minutos.
              </p>

              <p>
                <strong>Cargador:</strong>
                ${escaparHtml(reserva.cargador)}<br>

                <strong>Toma:</strong>
                ${escaparHtml(reserva.toma)}<br>

                <strong>Fecha:</strong>
                ${escaparHtml(formatearFecha(reserva.fecha))}<br>

                <strong>Hora:</strong>
                ${escaparHtml(reserva.hora_inicio)}
              </p>

              <p>
                Dispones de 15 minutos desde la hora de inicio para comenzar
                la carga. Si no la inicias en ese plazo, la reserva se
                liberará automáticamente.
              </p>
            `,
          ),
        );

        if (enviado) {
          resultado.avisosReserva++;
        }
      }

      const cargas = await obtenerRpc<CargaAviso>("cargaquer_cargas_aviso_fin");

      for (const carga of cargas) {
        const enviado = await procesarCorreo(
          "carga_fin_15_min",

          carga.carga_id,

          carga.email,

          "CargaQuer · Tu carga finalizará en 15 minutos",

          plantillaCorreo(
            "Tu carga finalizará en 15 minutos",

            `
              <p>
                Hola ${escaparHtml(carga.nombre || "Usuario")},
              </p>

              <p>
                Tu sesión de carga está próxima a finalizar.
              </p>

              <p>
                <strong>Cargador:</strong>
                ${escaparHtml(carga.cargador)}<br>

                <strong>Toma:</strong>
                ${escaparHtml(carga.toma)}<br>

                <strong>Fin previsto:</strong>
                ${escaparHtml(
                  formatearHoraMadrid(carga.fecha_hora_fin_prevista),
                )}
              </p>
            `,
          ),
        );

        if (enviado) {
          resultado.avisosFinCarga++;
        }
      }
    }

    return Response.json(
      {
        ok: resultado.errores === 0,

        ...resultado,
      },
      {
        headers: corsHeaders,
      },
    );
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

        headers: corsHeaders,
      },
    );
  }
});
