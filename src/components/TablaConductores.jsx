import React, { useState } from 'react'
import '../styles/Conductores.css'

function BadgeEstado({ estado }) {
  const config = {
    aprobado:  { clase: 'badge-estado badge-estado--aprobado',  label: '✅ Aprobado'  },
    pendiente: { clase: 'badge-estado badge-estado--pendiente', label: '⏳ Pendiente' },
    rechazado: { clase: 'badge-estado badge-estado--rechazado', label: '❌ Rechazado' },
  }
  const { clase, label } = config[estado] ?? { clase: 'badge-estado', label: estado }
  return <span className={clase}>{label}</span>
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function TablaConductores({ conductores, onEditar, onEliminar, onAprobar, onRechazar }) {
  const [expandido, setExpandido] = useState(null)

  function toggleFila(id) {
    setExpandido(prev => prev === id ? null : id)
  }

  if (conductores.length === 0) {
    return (
      <div className="conductores-vacio">
        <div className="conductores-vacio__icon">👨‍✈️</div>
        <p className="conductores-vacio__texto">No hay conductores para mostrar</p>
      </div>
    )
  }

  return (
    <div className="tabla-wrapper">
      <table className="conductores-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th className="col-licencia">Licencia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {conductores.map(c => {
            const detalle = c.conductor_detalle?.[0] ?? null
            const abierto = expandido === c.id

            return (
              <React.Fragment key={c.id}>
                {/* Fila principal */}
                <tr
                  className={`fila-conductor${abierto ? ' fila-conductor--expandida' : ''}`}
                  onClick={() => toggleFila(c.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="conductor-nombre">
                      <div className="conductor-avatar">
                        {c.nombre ? c.nombre[0].toUpperCase() : '?'}
                      </div>
                      <div className="conductor-nombre__info">
                        <span className="conductor-nombre__texto">{c.nombre || '—'}</span>
                      </div>
                      <span className={`fila-chevron${abierto ? ' fila-chevron--abierto' : ''}`} aria-hidden="true">›</span>
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <BadgeEstado estado={c.estado} />
                  </td>
                  <td className="col-licencia" onClick={e => e.stopPropagation()}>
                    {detalle?.tipo_licencia || '—'}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="tabla-acciones">
                      <button
                        className="accion-btn accion-btn--editar"
                        onClick={() => onEditar(c)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="accion-btn accion-btn--eliminar"
                        onClick={() => onEliminar(c)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                      {c.estado === 'pendiente' && (
                        <button
                          className="accion-btn accion-btn--aprobar"
                          onClick={() => onAprobar(c)}
                          title="Aprobar"
                        >
                          ✅
                        </button>
                      )}
                      {c.estado === 'aprobado' && (
                        <button
                          className="accion-btn accion-btn--rechazar"
                          onClick={() => onRechazar(c)}
                          title="Rechazar"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Panel expandible */}
                {abierto && (
                  <tr key={`${c.id}-detalle`} className="fila-detalle">
                    <td colSpan={4}>
                      <div className="panel-detalle">
                        <div className="panel-detalle__item">
                          <span className="panel-detalle__label">RUT</span>
                          <span className="panel-detalle__valor">{c.rut || '—'}</span>
                        </div>
                        <div className="panel-detalle__item">
                          <span className="panel-detalle__label">Teléfono</span>
                          <span className="panel-detalle__valor">{c.telefono || '—'}</span>
                        </div>
                        <div className="panel-detalle__item">
                          <span className="panel-detalle__label">Vencimiento licencia</span>
                          <span className="panel-detalle__valor">{formatFecha(detalle?.fecha_vencimiento_licencia)}</span>
                        </div>
                        <div className="panel-detalle__item">
                          <span className="panel-detalle__label">Experiencia</span>
                          <span className="panel-detalle__valor">
                            {detalle?.años_experiencia != null
                              ? `${detalle.años_experiencia} año${detalle.años_experiencia !== 1 ? 's' : ''}`
                              : '—'}
                          </span>
                        </div>
                        {detalle?.cod_licencia && (
                          <div className="panel-detalle__item">
                            <span className="panel-detalle__label">Código licencia</span>
                            <span className="panel-detalle__valor">{detalle.cod_licencia}</span>
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
