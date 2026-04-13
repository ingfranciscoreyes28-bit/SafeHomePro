import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import '../styles/PanelApoderado.css'
import ChatWidget from "../components/ChatWidget";


const formatMonto = m =>
  m == null
    ? '$0'
    : new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }).format(m)

export default function PanelApoderado() {
  const { perfil } = useAuth()

  const [estudiantes, setEstudiantes] = useState([])
  const [pagosPendientes, setPagosPendientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    if (!perfil?.id) return
    try {
      setCargando(true)
      setError(null)

      // 1) Estudiantes del apoderado con furgón y conductor anidados
      const { data: estData, error: errEst } = await supabase
        .from('estudiante')
        .select(
          '*, furgon!id_furgon(id, matricula, marca, modelo, perfil!furgon_id_conductor_fkey(id, nombre, telefono))'
        )
        .eq('id_apoderado', perfil.id)
        .order('nombre_estudiante')

      if (errEst) throw errEst
      setEstudiantes(estData ?? [])

      // 2) Pagos pendientes del apoderado (solo para el resumen)
      const { data: pagosData, error: errPagos } = await supabase
        .from('pago')
        .select('id, monto, estado_pago, descripcion, fecha_pago')
        .eq('id_apoderado', perfil.id)
        .eq('estado_pago', 'pendiente')

      if (errPagos) throw errPagos
      setPagosPendientes(pagosData ?? [])
    } catch (err) {
      console.error('Error al cargar panel apoderado:', err)
      setError('No se pudieron cargar los datos. Intenta recargar la página.')
    } finally {
      setCargando(false)
    }
  }, [perfil?.id])

  useEffect(() => { cargar() }, [cargar])

  // Totales para el resumen
  const totalPendientes = pagosPendientes.length
  const montoPendiente  = pagosPendientes.reduce((acc, p) => acc + (p.monto ?? 0), 0)

  // ── Render ──────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="panel-apod">
        <div className="panel-apod__loading">
          <span className="sh-spinner sh-spinner--dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p>Cargando tu panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel-apod">

      <div className="panel-apod__header">
        <h1 className="panel-apod__titulo">👨‍👩‍👧 Mi Panel</h1>
        <p className="panel-apod__sub">Información de tus hijos y pagos</p>
      </div>

      {error && (
        <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-5)' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Sin hijos registrados */}
      {!error && estudiantes.length === 0 && (
        <div className="panel-apod__empty">
          <div className="panel-apod__empty-icon">🧒</div>
          <p className="panel-apod__empty-titulo">Sin estudiantes registrados</p>
          <p className="panel-apod__empty-msg">
            Aún no tienes estudiantes registrados. Contacta al administrador para que los vincule a tu cuenta.
          </p>
        </div>
      )}

      {/* Con hijos */}
      {estudiantes.length > 0 && (
        <>
          {/* ── Resumen de pagos ─────────────────────────── */}
          <div className="panel-apod-resumen">
            <div className="panel-apod-resumen-card">
              <span className="panel-apod-resumen-card__label">Pagos pendientes</span>
              <span className={`panel-apod-resumen-card__valor${totalPendientes > 0 ? ' panel-apod-resumen-card__valor--peligro' : ' panel-apod-resumen-card__valor--ok'}`}>
                {totalPendientes}
              </span>
              <span className="panel-apod-resumen-card__hint">
                {totalPendientes === 0 ? 'Al día ✅' : `${totalPendientes} pago${totalPendientes !== 1 ? 's' : ''} por cobrar`}
              </span>
            </div>

            <div className="panel-apod-resumen-card">
              <span className="panel-apod-resumen-card__label">Monto adeudado</span>
              <span className={`panel-apod-resumen-card__valor${montoPendiente > 0 ? ' panel-apod-resumen-card__valor--peligro' : ' panel-apod-resumen-card__valor--ok'}`}>
                {formatMonto(montoPendiente)}
              </span>
              <span className="panel-apod-resumen-card__hint">Total en pagos pendientes</span>
            </div>
          </div>

          {/* ── Mis hijos ────────────────────────────────── */}
          <div className="panel-apod__seccion-titulo">
            🧒 Mis hijos
            <span>{estudiantes.length}</span>
          </div>

          <div className="panel-apod-hijos-grid">
            {estudiantes.map(est => {
              const furgon    = est.furgon
              const conductor = furgon?.perfil

              return (
                <div key={est.id} className="panel-apod-hijo-card">

                  {/* Cabecera: avatar + datos básicos */}
                  <div className="panel-apod-hijo-card__top">
                    <div className="panel-apod-hijo-card__avatar">
                      {est.nombre_estudiante?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div className="panel-apod-hijo-card__nombre">
                        {est.nombre_estudiante}
                      </div>
                      <div className="panel-apod-hijo-card__meta">
                        {[est.curso, est.colegio].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </div>
                  </div>

                  <hr className="panel-apod-hijo-card__divider" />

                  {/* Subsección furgón */}
                  <div className="panel-apod-hijo-card__furgon">
                    <div className="panel-apod-hijo-card__furgon-label">Furgón asignado</div>

                    {furgon ? (
                      <>
                        <div className="panel-apod-hijo-card__matricula">
                          {furgon.matricula}
                        </div>
                        <div className="panel-apod-hijo-card__furgon-modelo">
                          {furgon.marca} {furgon.modelo}
                        </div>

                        {/* Subsección conductor */}
                        <div className="panel-apod-hijo-card__conductor">
                          <span className="panel-apod-hijo-card__conductor-label">
                            👨‍✈️ Conductor
                          </span>
                          <span className="panel-apod-hijo-card__conductor-nombre">
                            {conductor?.nombre || '—'}
                          </span>
                          {conductor?.telefono && (
                            <span className="panel-apod-hijo-card__conductor-tel">
                              📞 {conductor.telefono}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="panel-apod-hijo-card__sin-furgon">
                        Sin furgón asignado aún
                      </p>
                    )}
                  </div>

                  {/* TODO: integrar pasarela de pagos */}
                </div>
              )
            })}
          </div>

          <ChatWidget />
        </>
      )}
    </div>
  )
}
