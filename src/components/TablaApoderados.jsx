import React, { useState } from 'react'
import '../styles/Apoderados.css'

export default function TablaApoderados({ apoderados, onEditar, onEliminar }) {
  const [expandido, setExpandido] = useState(null)

  function toggle(id) { setExpandido(prev => prev === id ? null : id) }

  if (apoderados.length === 0) {
    return (
      <div className="apoderados-vacio">
        <div className="apoderados-vacio__icon">👨‍👩‍👧</div>
        <p className="apoderados-vacio__texto">No hay apoderados registrados</p>
      </div>
    )
  }

  return (
    <div className="apoderados-tabla-wrapper">
      <table className="apoderados-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {apoderados.map(a => {
            const abierto = expandido === a.id
            return (
              <React.Fragment key={a.id}>
                <tr
                  className={abierto ? 'fila-expandida' : ''}
                  onClick={() => toggle(a.id)}
                >
                  <td>
                    <div className="apoderado-nombre">
                      <div className="apoderado-avatar">
                        {a.nombre?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                        {a.nombre || '—'}
                      </span>
                      <span className={`apoderado-chevron${abierto ? ' apoderado-chevron--abierto' : ''}`}>›</span>
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <span className={`badge-estado ${a.estado === 'aprobado' ? 'badge-estado--aprobado' : 'badge-estado--pendiente'}`}
                      style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '9999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                      {a.estado === 'aprobado' ? '✅ Aprobado' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="apoderados-acciones">
                      <button className="apoderado-accion-btn" onClick={() => onEditar(a)} title="Editar">✏️</button>
                      <button className="apoderado-accion-btn apoderado-accion-btn--eliminar" onClick={() => onEliminar(a)} title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>

                {abierto && (
                  <tr key={`${a.id}-det`} className="fila-apoderado-detalle">
                    <td colSpan={3} style={{ padding: 0, borderBottom: '1px solid var(--color-border)' }}>
                      <div className="apoderado-panel-detalle">
                        <div className="apoderado-detalle-item">
                          <span className="apoderado-detalle-label">RUT</span>
                          <span className="apoderado-detalle-valor">{a.rut || '—'}</span>
                        </div>
                        <div className="apoderado-detalle-item">
                          <span className="apoderado-detalle-label">Teléfono</span>
                          <span className="apoderado-detalle-valor">{a.telefono || '—'}</span>
                        </div>
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
