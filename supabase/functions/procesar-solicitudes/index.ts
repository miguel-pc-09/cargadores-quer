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

interface SolicitudPendiente {
  id: string;

  usuario_id: string;

  nombre: string;

  apellidos: string;

  email: string;

  matricula: string;
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
              CARGA ELÉCTRICA MUNICIPAL ·
              AYUNTAMIENTO DE QUER
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
            Este es un aviso
            automático de CargaQuer.
          </p>

        </div>

      </body>

    </html>
  `;
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
    console.error("No se ha podido guardar el aviso:", error);
  }
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

async function procesarCorreo(
  tipo: string,
  referenciaId: string,
  destinatario: string,
  asunto: string,
  html: string,
  detalle?: Record<string, unknown>,
) {
  if (await avisoYaEnviado(tipo, referenciaId, destinatario)) {
    return false;
  }

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
    await guardarResultado(tipo, referenciaId, destinatario, "error", {
      ...detalle,

      error: error instanceof Error ? error.message : String(error),
    });

    console.error(`Error enviando ${tipo}:`, error);

    return false;
  }
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

  const { data, error } = await supabase
    .from("solicitudes_registro")
    .select("id,usuario_id,nombre,apellidos,email,matricula")
    .eq("estado", "pendiente")
    .order("creado_en", {
      ascending: true,
    });

  if (error) {
    return Response.json(
      {
        ok: false,

        error: error.message,
      },
      {
        status: 500,
      },
    );
  }

  const solicitudes = (data ?? []) as SolicitudPendiente[];

  let correosUsuario = 0;

  let correosAdministrador = 0;

  for (const solicitud of solicitudes) {
    const nombreCompleto = escaparHtml(
      `${solicitud.nombre} ${solicitud.apellidos}`.trim(),
    );

    const matricula = escaparHtml(solicitud.matricula);

    const usuarioEnviado = await procesarCorreo(
      "solicitud_recibida",

      solicitud.id,

      solicitud.email,

      "CargaQuer · Hemos recibido tu solicitud",

      plantillaCorreo(
        "Solicitud recibida",

        `
              <p>
                Hola
                ${escaparHtml(solicitud.nombre)},
              </p>

              <p>
                Hemos recibido
                correctamente tu
                solicitud de acceso
                a CargaQuer.
              </p>

              <p>
                El Ayuntamiento de
                Quer debe revisarla
                antes de que puedas
                acceder al servicio.
              </p>

              <p>
                <strong>
                  Matrícula:
                </strong>
                ${matricula}
              </p>

              <p>
                Te enviaremos otro
                correo cuando tu
                solicitud haya sido
                aprobada.
              </p>
            `,
      ),
    );

    if (usuarioEnviado) {
      correosUsuario++;
    }

    const administradorEnviado = await procesarCorreo(
      "nuevo_usuario_admin",

      solicitud.id,

      ADMIN_EMAIL,

      "CargaQuer · Nueva solicitud pendiente",

      plantillaCorreo(
        "Nueva solicitud pendiente de aprobación",

        `
              <p>
                Se ha registrado
                una nueva solicitud
                de acceso a
                CargaQuer.
              </p>

              <p>
                <strong>
                  Usuario:
                </strong>
                ${nombreCompleto}
                <br>

                <strong>
                  Correo:
                </strong>
                ${escaparHtml(solicitud.email)}
                <br>

                <strong>
                  Matrícula:
                </strong>
                ${matricula}
              </p>

              <p>
                Entra en el panel
                de administración
                para aceptarla o
                rechazarla.
              </p>
            `,
      ),

      {
        usuario_email: solicitud.email,

        matricula: solicitud.matricula,
      },
    );

    if (administradorEnviado) {
      correosAdministrador++;
    }
  }

  return Response.json({
    ok: true,

    solicitudesPendientes: solicitudes.length,

    correosUsuario,

    correosAdministrador,
  });
});
