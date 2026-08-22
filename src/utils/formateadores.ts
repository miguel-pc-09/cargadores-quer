// Función para formatear una duración.
export function formatearDuracionReserva(minutos: number) {
  const horas = Math.floor(minutos / 60);

  const minutosRestantes = minutos % 60;

  if (horas === 0) {
    return `${minutosRestantes} min`;
  }

  if (minutosRestantes === 0) {
    return `${horas} ${horas === 1 ? "hora" : "horas"}`;
  }

  return `${horas} h ${minutosRestantes} min`;
}
