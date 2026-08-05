interface MensajeCampoProps {
  error?: string;
  ayuda?: string;
}

function MensajeCampo({ error, ayuda }: MensajeCampoProps) {
  return (
    <div className="registro__mensaje">
      {error ? (
        <small className="registro__error" role="alert">
          {error}
        </small>
      ) : (
        ayuda && <small className="registro__ayuda">{ayuda}</small>
      )}
    </div>
  );
}

export default MensajeCampo;
