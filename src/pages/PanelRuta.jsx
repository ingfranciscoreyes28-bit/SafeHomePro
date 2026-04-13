import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import '../styles/PanelRuta.css'
import ChatWidget from "../components/ChatWidget";

export default function PanelRuta() {
  const { perfil } = useAuth()

  const [furgon, setFurgon]         = useState(null)     // null = sin asignar
  const [estudiantes, setEstudiantes] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState(null)

  const cargar = useCallback(async () => {
    if (!perfil?.id) return
    try {
      setCargando(true)
      setError(null)

      // 1) Obtener furgón asignado al conductor
      const { data: furgonData, error: errFurgon } = await supabase
        .from('furgon')
        .select('*')
        .eq('id_conductor', perfil.id)
        .maybeSingle()

      if (errFurgon) throw errFurgon
      setFurgon(furgonData)

      // 2) Si hay furgón, obtener sus estudiantes
      if (furgonData) {
        const { data: estData, error: errEst } = await supabase
          .from('estudiante')
          .select('*, perfil!id_apoderado(id, nombre, telefono)')
          .eq('id_furgon', furgonData.id)
          .order('nombre_estudiante')

        if (errEst) throw errEst
        setEstudiantes(estData ?? [])
      } else {
        setEstudiantes([])
      }
    } catch (err) {
      console.error('Error al cargar panel de ruta:', err)
      setError('No se pudieron cargar los datos. Intenta recargar la página.')
    } finally {
      setCargando(false)
    }
  }, [perfil?.id])

  useEffect(() => { cargar() }, [cargar])

  // ── Render ──────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="panel-ruta">
        <div className="panel-ruta__loading">
          <span className="sh-spinner sh-spinner--dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p>Cargando tu ruta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel-ruta">

      <div className="panel-ruta__header">
        <h1 className="panel-ruta__titulo">🚌 Mi Ruta</h1>
        <p className="panel-ruta__sub">Información de tu furgón asignado</p>
      </div>

      {error && (
        <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-5)' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Sin furgón asignado */}
      {!furgon && !error && (
        <div className="panel-ruta__empty">
          <div className="panel-ruta__empty-icon">🚐</div>
          <p className="panel-ruta__empty-titulo">Sin furgón asignado</p>
          <p className="panel-ruta__empty-msg">
            No tienes un furgón asignado aún. Contacta al administrador para que te asigne uno.
          </p>
        </div>
      )}

      {/* Con furgón */}
      {furgon && (
        <>
          {/* Card del furgón */}
          <div className="panel-ruta-card">
            <div className="panel-ruta-card__matricula">{furgon.matricula}</div>
            <div className="panel-ruta-card__modelo">
              {furgon.marca} {furgon.modelo}
            </div>
            <div className="panel-ruta-card__meta">
              <div className="panel-ruta-card__meta-item">
                <span className="panel-ruta-card__meta-label">Año</span>
                <span className="panel-ruta-card__meta-valor">{furgon.anio || '—'}</span>
              </div>
              <div className="panel-ruta-card__meta-item">
                <span className="panel-ruta-card__meta-label">Capacidad</span>
                <span className="panel-ruta-card__meta-valor">{furgon.capacidad} asientos</span>
              </div>
              <div className="panel-ruta-card__meta-item">
                <span className="panel-ruta-card__meta-label">Estudiantes asignados</span>
                <span className="panel-ruta-card__meta-valor panel-ruta-card__meta-valor--destac">
                  {estudiantes.length}
                </span>
              </div>
            </div>
          </div>

          {/* Sección estudiantes */}
          <div className="panel-ruta__seccion-titulo">
            🧒 Estudiantes asignados
            <span>{estudiantes.length}</span>
          </div>

          {estudiantes.length === 0 ? (
            <div className="panel-ruta__est-vacio">
              Aún no hay estudiantes asignados a este furgón.
            </div>
          ) : (
            <div className="panel-ruta-est-grid">
              {estudiantes.map(est => (
                <div key={est.id} className="panel-ruta-est-card">
                  <div className="panel-ruta-est-card__top">
                    <div className="panel-ruta-est-card__avatar">
                      {est.nombre_estudiante?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div className="panel-ruta-est-card__nombre">{est.nombre_estudiante}</div>
                      <div className="panel-ruta-est-card__curso">
                        {[est.curso, est.colegio].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </div>
                  </div>

                  <hr className="panel-ruta-est-card__divider" />

                  <div className="panel-ruta-est-card__info">
                    {est.rut_estudiante && (
                      <div className="panel-ruta-est-card__fila">
                        <span className="panel-ruta-est-card__lbl">RUT</span>
                        <span className="panel-ruta-est-card__val">{est.rut_estudiante}</span>
                      </div>
                    )}
                    <div className="panel-ruta-est-card__fila">
                      <span className="panel-ruta-est-card__lbl">Apoderado</span>
                      <span className="panel-ruta-est-card__val">
                        {est.perfil?.nombre || <em style={{ color: 'var(--color-text-muted)' }}>Sin asignar</em>}
                      </span>
                    </div>
                    {est.perfil?.telefono && (
                      <div className="panel-ruta-est-card__fila">
                        <span className="panel-ruta-est-card__lbl">Teléfono</span>
                        <span className="panel-ruta-est-card__val">{est.perfil.telefono}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}


      
    <ChatWidget />
    </div>
  )
}
