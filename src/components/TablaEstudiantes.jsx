import React, { useState } from 'react'
import '../styles/Estudiantes.css'

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function TablaEstudiantes({ estudiantes, onEditar, onEliminar }) {
  const [expandido, setExpandido] = useState(null)

  function toggle(id) { setExpandido(prev => prev === id ? null : id) }

  if (estudiantes.length === 0) {
    return (
      <div className="estudiantes-vacio">
        <div className="estudiantes-vacio__icon">🧒</div>
        <p className="estudiantes-vacio__texto">No hay estudiantes registrados</p>
      </div>
    )
  }

  return (
    <div className="estudiantes-tabla-wrapper">
      <table className="estudiantes-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Curso</th>
            <th>Apoderado</th>
            <th>Furgón</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map(e => {
            const abierto = expandido === e.id
            const furgonLabel = e.furgon
              ? `${e.furgon.matricula} — ${e.furgon.marca} ${e.furgon.modelo}`.trim()
              : null

            return (
              <React.Fragment key={e.id}>
                <tr
                  className={abierto ? 'fila-est-expandida' : ''}
                  onClick={() => toggle(e.id)}
                >
                  <td>
                    <div className="estudiante-nombre">
                      <div className="estudiante-avatar">
                        {e.nombre_estudiante?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="estudiante-nombre__texto">{e.nombre_estudiante || '—'}</span>
                      <span className={`est-chevron${abierto ? ' est-chevron--abierto' : ''}`}>›</span>
                    </div>
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>{e.curso || '—'}</td>
                  <td onClick={ev => ev.stopPropagation()}>
                    {e.perfil?.nombre
                      ? <span style={{ color: 'var(--color-role-apoderado)' }}>{e.perfil.nombre}</span>
                      : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin asignar</span>}
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>
                    {furgonLabel
                      ? <span className="est-furgon-badge">{e.furgon.matricula}</span>
                      : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.8125rem' }}>Sin asignar</span>}
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>
                    <div className="estudiantes-acciones">
                      <button className="est-accion-btn" onClick={() => onEditar(e)} title="Editar">✏️</button>
                      <button className="est-accion-btn est-accion-btn--eliminar" onClick={() => onEliminar(e)} title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>

                {abierto && (
                  <tr key={`${e.id}-det`} className="fila-est-detalle">
                    <td colSpan={5} style={{ padding: 0, borderBottom: '1px solid var(--color-border)' }}>
                      <div className="est-panel-detalle">
                        <div className="est-detalle-item">
                          <span className="est-detalle-label">RUT</span>
                          <span className="est-detalle-valor">{e.rut_estudiante || '—'}</span>
                        </div>
                        <div className="est-detalle-item">
                          <span className="est-detalle-label">Colegio</span>
                          <span className="est-detalle-valor">{e.colegio || '—'}</span>
                        </div>
                        <div className="est-detalle-item">
                          <span className="est-detalle-label">Fecha nacimiento</span>
                          <span className="est-detalle-valor">{formatFecha(e.fecha_nacimiento)}</span>
                        </div>
                        {furgonLabel && (
                          <div className="est-detalle-item">
                            <span className="est-detalle-label">Furgón</span>
                            <span className="est-detalle-valor">{furgonLabel}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
