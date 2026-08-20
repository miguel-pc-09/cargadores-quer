// Valida el formato de un correo electrónico.
export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Valida teléfonos móviles españoles.
export function validarTelefono(telefono: string): boolean {
  const telefonoLimpio = telefono.replace(/\D/g, "");

  return /^[67]\d{8}$/.test(telefonoLimpio);
}

// Normaliza un DNI o NIE.
export function normalizarDocumento(documento: string): string {
  return documento.trim().toUpperCase().replace(/[\s-]/g, "");
}

// Valida el formato de un DNI o NIE.
export function validarDocumento(documento: string): boolean {
  return /^[XYZ]?\d{7,8}[A-Z]$/.test(normalizarDocumento(documento));
}

// Valida matrículas actuales y antiguas.
export function validarMatricula(matricula: string): boolean {
  const matriculaLimpia = matricula.trim().toUpperCase().replace(/[\s-]/g, "");

  const matriculaActual = /^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/;

  const matriculaAntigua = /^[A-Z]{1,2}\d{4}[A-Z]{1,2}$/;

  return (
    matriculaActual.test(matriculaLimpia) ||
    matriculaAntigua.test(matriculaLimpia)
  );
}
