export type TipoCliente = "ayuntamiento" | "empresa";

export interface Cliente {
  id: string;
  nombre: string;
  tipo: TipoCliente;
  correoSolicitudes: string;
  activo: boolean;
}
