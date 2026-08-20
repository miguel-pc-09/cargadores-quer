// Propiedades del mensaje del campo.
interface MensajeCampoProps {
  error?: string;
  ayuda?: string;
}

// Componente para mostrar errores o ayuda.
function MensajeCampo({ error, ayuda }: MensajeCampoProps) {
  return (
    <div className="registro__mensaje">
      {/* Muestra primero el error. */}
      {error ? (
        <span className="registro__error">{error}</span>
      ) : (
        ayuda && <span className="registro__ayuda">{ayuda}</span>
      )}
    </div>
  );
}

export default MensajeCampo;
