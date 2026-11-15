export default function EstadoCatalogo({ estado, reintentar }) {
  if (estado === "cargando") {
    return <p role="status">Cargando torneos…</p>;
  }
  return (
    <div className="alert alert-danger">
      <p role="alert">No se pudieron cargar los datos.</p>
      <button type="button" className="btn btn-outline-danger" onClick={reintentar}>
        Reintentar
      </button>
    </div>
  );
}
