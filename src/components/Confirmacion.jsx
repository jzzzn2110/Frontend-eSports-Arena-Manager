export default function Confirmacion({
  texto,
  onConfirmar,
  onCancelar,
  etiquetaConfirmar = "Confirmar eliminación",
}) {
  return (
    <div className="alert alert-warning mt-3" role="alert">
      <p>{texto}</p>
      <div className="d-flex gap-2 flex-wrap">
        <button type="button" className="btn btn-danger" onClick={onConfirmar}>
          {etiquetaConfirmar}
        </button>
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={onCancelar}
        >
          Conservar
        </button>
      </div>
    </div>
  );
}
