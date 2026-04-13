import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import '../styles/PagosApoderado.css'

// ── Helpers ──────────────────────────────────────────────────

const formatMonto = m =>
  m == null
    ? '—'
    : new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }).format(m)

const formatFecha = f => {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ── Badge de estado ───────────────────────────────────────────

function BadgePago({ estado }) {
  const cfg = {
    pagado:    { clase: 'badge-pago-apod badge-pago-apod--pagado',     label: '✅ Pagado'    },
    pendiente: { clase: 'badge-pago-apod badge-pago-apod--pendiente',  label: '⏳ Pendiente' },
    atrasado:  { clase: 'badge-pago-apod badge-pago-apod--atrasado',   label: '🔴 Atrasado'  },
  }
  const { clase, label } = cfg[estado] ?? { clase: 'badge-pago-apod', label: estado }
  return <span className={clase}>{label}</span>
}

// ── Filtros disponibles ───────────────────────────────────────

const FILTROS = [
  { key: 'todos',     label: 'Todos'     },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'pagado',    label: 'Pagado'    },
  { key: 'atrasado',  label: 'Atrasado'  },
]

// ── Componente principal ──────────────────────────────────────

export default function PagosApoderado() {
  const { perfil } = useAuth()

  const [pagos, setPagos]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)
  const [filtro, setFiltro]     = useState('todos')

  const cargar = useCallback(async () => {
    if (!perfil?.id) return
    try {
      setCargando(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('pago')
        .select('*, estudiante!id_estudiante(id, nombre_estudiante)')
        .eq('id_apoderado', perfil.id)
        .order('created_at', { ascending: false })

      if (err) throw err
      setPagos(data ?? [])
    } catch (err) {
      console.error('Error al cargar pagos del apoderado:', err)
      setError('No se pudieron cargar los pagos. Intenta recargar la página.')
    } finally {
      setCargando(false)
    }
  }, [perfil?.id])

  useEffect(() => { cargar() }, [cargar])

  // ── Cálculos de resumen ──────────────────────────────────────

  const sumaPor = estado =>
    pagos
      .filter(p => p.estado_pago === estado)
      .reduce((acc, p) => acc + (p.monto ?? 0), 0)

  const totalPagado   = sumaPor('pagado')
  const totalPendiente = sumaPor('pendiente')
  const totalAtrasado  = sumaPor('atrasado')

  // ── Lista filtrada ───────────────────────────────────────────

  const pagosFiltrados =
    filtro === 'todos' ? pagos : pagos.filter(p => p.estado_pago === filtro)

  // ── Render ───────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="pagos-apod">
        <div className="pagos-apod__loading">
          <span className="sh-spinner sh-spinner--dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p>Cargando tus pagos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pagos-apod">

      <div className="pagos-apod__header">
        <h1 className="pagos-apod__titulo">💰 Mis Pagos</h1>
        <p className="pagos-apod__sub">
          {pagos.length} pago{pagos.length !== 1 ? 's' : ''} en tu historial
        </p>
      </div>

      {error && (
        <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-5)' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Sin pagos en absoluto */}
      {!error && pagos.length === 0 && (
        <div className="pagos-apod__empty">
          <div className="pagos-apod__empty-icon">💰</div>
          <p className="pagos-apod__empty-msg">Aún no tienes pagos registrados.</p>
        </div>
      )}

      {/* Con pagos */}
      {pagos.length > 0 && (
        <>
          {/* ── Resumen de montos ──────────────────────── */}
          <div className="pagos-apod-resumen">
            <div className="pagos-apod-resumen-card">
              <span className="pagos-apod-resumen-card__label">Total pagado</span>
              <span className="pagos-apod-resumen-card__valor pagos-apod-resumen-card__valor--pagado">
                {formatMonto(totalPagado)}
              </span>
            </div>
            <div className="pagos-apod-resumen-card">
              <span className="pagos-apod-resumen-card__label">Pendiente</span>
              <span className="pagos-apod-resumen-card__valor pagos-apod-resumen-card__valor--pendiente">
                {formatMonto(totalPendiente)}
              </span>
            </div>
            <div className="pagos-apod-resumen-card">
              <span className="pagos-apod-resumen-card__label">Atrasado</span>
              <span className="pagos-apod-resumen-card__valor pagos-apod-resumen-card__valor--atrasado">
                {formatMonto(totalAtrasado)}
              </span>
            </div>
          </div>

          {/* ── Filtros ────────────────────────────────── */}
          <div className="pagos-apod-filtros">
            {FILTROS.map(f => (
              <button
                key={f.key}
                className={`pagos-apod-filtro-btn${filtro === f.key ? ' pagos-apod-filtro-btn--activo' : ''}`}
                onClick={() => setFiltro(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sin resultados para el filtro activo */}
          {pagosFiltrados.length === 0 ? (
            <div className="pagos-apod__filtro-vacio">
              No hay pagos en este estado.
            </div>
          ) : (
            /* ── Tabla de pagos ──────────────────────── */
            <div className="pagos-apod-tabla-wrapper">
              <table className="pagos-apod-tabla">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Método</th>
                    <th>Fecha pago</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.map(p => (
                    <tr key={p.id}>
                      <td>
                        <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                          {p.estudiante?.nombre_estudiante || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="pagos-apod-monto">{formatMonto(p.monto)}</span>
                      </td>
                      <td>
                        <BadgePago estado={p.estado_pago} />
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {p.metodo_pago || '—'}
                      </td>
                      <td>{formatFecha(p.fecha_pago)}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.descripcion || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TODO: integrar pasarela de pagos */}
        </>
      )}
    </div>
  )
}
