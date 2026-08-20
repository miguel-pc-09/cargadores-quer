// Tipos de cliente disponibles.
export type TipoCliente = "ayuntamiento" | "empresa";

// Datos de cada cliente.
export interface Cliente {
  id: string;
  nombre: string;
  tipo: TipoCliente;
  correoSolicitudes: string;
  activo: boolean;
}
