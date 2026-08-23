import { createClient } from "npm:@supabase/supabase-js@2";

// Variables necesarias para el acceso.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const ADMIN_LOGIN_EMAIL = Deno.env.get("ADMIN_LOGIN_EMAIL") ?? "";

// Cabeceras CORS.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Función principal.
Deno.serve(async (request) => {
  // Responde a CORS.
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // Solo permite POST.
  if (request.method !== "POST") {
    return new Response("Método no permitido", {
      status: 405,

      headers: corsHeaders,
    });
  }

  // Comprueba la configuración.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ADMIN_LOGIN_EMAIL) {
    return Response.json(
      {
        error: "La configuración del acceso administrativo está incompleta.",
      },
      {
        status: 500,

        headers: corsHeaders,
      },
    );
  }

  try {
    const cuerpo = await request.json();

    const contrasena =
      typeof cuerpo?.contrasena === "string" ? cuerpo.contrasena : "";

    if (!contrasena) {
      return Response.json(
        {
          error: "Introduce la contraseña.",
        },
        {
          status: 400,

          headers: corsHeaders,
        },
      );
    }

    // Cliente independiente para autenticar al administrador.
    const clienteAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,

        autoRefreshToken: false,
      },
    });

    const { data, error } = await clienteAuth.auth.signInWithPassword({
      email: ADMIN_LOGIN_EMAIL,

      password: contrasena,
    });

    if (error || !data.session || !data.user) {
      return Response.json(
        {
          error: "Usuario o contraseña incorrectos.",
        },
        {
          status: 401,

          headers: corsHeaders,
        },
      );
    }

    // Devuelve los tokens para crear la sesión.
    return Response.json(
      {
        accessToken: data.session.access_token,

        refreshToken: data.session.refresh_token,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Error en el acceso administrativo:", error);

    return Response.json(
      {
        error: "No se ha podido iniciar sesión.",
      },
      {
        status: 500,

        headers: corsHeaders,
      },
    );
  }
});
