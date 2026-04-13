import '../styles/Furgones.css'

export default function TablaFurgones({ furgones, onEditar, onEliminar }) {
  if (furgones.length === 0) {
    return (
      <div className="furgones-vacio">
        <div className="furgones-vacio__icon">🚌</div>
        <p className="furgones-vacio__texto">No hay furgones registrados</p>
      </div>
    )
  }

  return (
    <div className="furgones-tabla-wrapper">
      <table className="furgones-tabla">
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Capacidad</th>
            <th>Conductor asignado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {furgones.map(f => (
            <tr key={f.id}>
              <td>
                <span className="furgon-matricula">{f.matricula || '—'}</span>
              </td>
              <td>{f.marca || '—'}</td>
              <td>{f.modelo || '—'}</td>
              <td>{f.anio || '—'}</td>
              <td>{f.capacidad ? `${f.capacidad} pasajeros` : '—'}</td>
              <td>
                {f.perfil ? (
                  <div className="furgon-conductor">
                    <div className="furgon-conductor__avatar">
                      {f.perfil.nombre?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span>{f.perfil.nombre}</span>
                  </div>
                ) : (
                  <span className="furgon-sin-conductor">Sin asignar</span>
                )}
              </td>
              <td>
                <div className="furgones-acciones">
                  <button
                    className="furgon-accion-btn"
                    onClick={() => onEditar(f)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="furgon-accion-btn furgon-accion-btn--eliminar"
                    onClick={() => onEliminar(f)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
