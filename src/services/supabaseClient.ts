import { createClient } from "@supabase/supabase-js";

// Variables de conexión definidas en el archivo de entorno.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Comprueba que estén configuradas las variables necesarias.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.",
  );
}

// Cliente de Supabase utilizado en toda la aplicación.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
