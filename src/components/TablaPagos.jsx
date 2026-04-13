import React, { useState } from 'react'
import '../styles/Pagos.css'

function BadgePago({ estado }) {
  const cfg = {
    pagado:    { clase: 'badge-pago badge-pago--pagado',    label: '✅ Pagado'    },
    pendiente: { clase: 'badge-pago badge-pago--pendiente', label: '⏳ Pendiente' },
    atrasado:  { clase: 'badge-pago badge-pago--atrasado',  label: '🔴 Atrasado'  },
  }
  const { clase, label } = cfg[estado] ?? { clase: 'badge-pago', label: estado }
  return <span className={clase}>{label}</span>
}

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatMonto(m) {
  if (m == null) return '—'
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(m)
}

export default function TablaPagos({ pagos, onMarcarPagado, onEliminar }) {
  const [expandido, setExpandido] = useState(null)

  function toggle(id) { setExpandido(prev => prev === id ? null : id) }

  if (pagos.length === 0) {
    return (
      <div className="pagos-vacio">
        <div className="pagos-vacio__icon">💰</div>
        <p className="pagos-vacio__texto">No hay pagos registrados</p>
      </div>
    )
  }

  return (
    <div className="pagos-tabla-wrapper">
      <table className="pagos-tabla">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Apoderado</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map(p => {
            const abierto = expandido === p.id
            return (
              <React.Fragment key={p.id}>
                <tr
                  className={abierto ? 'fila-pago-expandida' : ''}
                  onClick={() => toggle(p.id)}
                >
                  <td>
                    <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                      {p.estudiante?.nombre_estudiante || '—'}
                    </span>
                    <span className={`pago-chevron${abierto ? ' pago-chevron--abierto' : ''}`}>›</span>
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>
                    {p.perfil?.nombre
                      ? <span style={{ color: 'var(--color-role-apoderado)' }}>{p.perfil.nombre}</span>
                      : '—'}
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>
                    <span className="pago-monto">{formatMonto(p.monto)}</span>
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>
                    <BadgePago estado={p.estado_pago} />
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>
                    <div className="pagos-acciones">
                      {p.estado_pago !== 'pagado' && (
                        <button
                          className="pago-accion-btn pago-accion-btn--pagado"
                          onClick={() => onMarcarPagado(p)}
                          title="Marcar como pagado"
                        >
                          ✅
                        </button>
                      )}
                      <button
                        className="pago-accion-btn pago-accion-btn--eliminar"
                        onClick={() => onEliminar(p)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>

                {abierto && (
                  <tr key={`${p.id}-det`} className="fila-pago-detalle">
                    <td colSpan={5} style={{ padding: 0, borderBottom: '1px solid var(--color-border)' }}>
                      <div className="pago-panel-detalle">
                        <div className="pago-detalle-item">
                          <span className="pago-detalle-label">Fecha de pago</span>
                          <span className="pago-detalle-valor">{formatFecha(p.fecha_pago)}</span>
                        </div>
                        <div className="pago-detalle-item">
                          <span className="pago-detalle-label">Método</span>
                          <span className="pago-detalle-valor" style={{ textTransform: 'capitalize' }}>
                            {p.metodo_pago || '—'}
                          </span>
                        </div>
                        <div className="pago-detalle-item">
                          <span className="pago-detalle-label">Descripción</span>
                          <span className="pago-detalle-valor">{p.descripcion || '—'}</span>
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
