import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import '../styles/PanelEstudiantes.css'

export default function PanelEstudiantes() {
  const { perfil } = useAuth()

  const [furgon, setFurgon]           = useState(null)
  const [estudiantes, setEstudiantes] = useState([])
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState(null)
  const [busqueda, setBusqueda]       = useState('')

  const cargar = useCallback(async () => {
    if (!perfil?.id) return
    try {
      setCargando(true)
      setError(null)

      // 1) Obtener furgón del conductor
      const { data: furgonData, error: errFurgon } = await supabase
        .from('furgon')
        .select('id, matricula, marca, modelo, capacidad')
        .eq('id_conductor', perfil.id)
        .maybeSingle()

      if (errFurgon) throw errFurgon
      setFurgon(furgonData)

      // 2) Obtener estudiantes del furgón
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
      console.error('Error al cargar estudiantes:', err)
      setError('No se pudieron cargar los estudiantes. Intenta recargar la página.')
    } finally {
      setCargando(false)
    }
  }, [perfil?.id])

  useEffect(() => { cargar() }, [cargar])

  const estudiantesFiltrados = estudiantes.filter(e => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return (
      e.nombre_estudiante?.toLowerCase().includes(q) ||
      e.curso?.toLowerCase().includes(q) ||
      e.colegio?.toLowerCase().includes(q) ||
      e.rut_estudiante?.toLowerCase().includes(q)
    )
  })

  // ── Render ──────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="panel-est">
        <div className="panel-est__loading">
          <span className="sh-spinner sh-spinner--dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p>Cargando estudiantes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel-est">

      <div className="panel-est__header">
        <div>
          <h1 className="panel-est__titulo">🧒 Mis Estudiantes</h1>
          <p className="panel-est__sub">
            {furgon
              ? `${estudiantes.length} estudiante${estudiantes.length !== 1 ? 's' : ''} asignado${estudiantes.length !== 1 ? 's' : ''} a tu furgón`
              : 'Sin furgón asignado'}
          </p>
        </div>
      </div>

      {error && (
        <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-5)' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Sin furgón */}
      {!furgon && !error && (
        <div className="panel-est__empty">
          <div className="panel-est__empty-icon">🚐</div>
          <p className="panel-est__empty-titulo">Sin furgón asignado</p>
          <p className="panel-est__empty-msg">
            No tienes un furgón asignado aún. Contacta al administrador.
          </p>
        </div>
      )}

      {/* Con furgón */}
      {furgon && (
        <>
          <div className="panel-est__busqueda">
            <input
              type="text"
              className="sh-input"
              placeholder="Buscar por nombre, RUT, curso o colegio..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </div>

          {estudiantesFiltrados.length === 0 ? (
            <div className="panel-est__empty">
              <div className="panel-est__empty-icon">🧒</div>
              <p className="panel-est__empty-titulo">Sin resultados</p>
              <p className="panel-est__empty-msg">
                {busqueda
                  ? 'No se encontraron estudiantes que coincidan con la búsqueda.'
                  : 'Aún no hay estudiantes asignados a tu furgón.'}
              </p>
            </div>
          ) : (
            <div className="panel-est-tabla-wrapper">
              <table className="panel-est-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>RUT</th>
                    <th>Curso</th>
                    <th>Colegio</th>
                    <th>Apoderado</th>
                    <th>Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantesFiltrados.map(e => (
                    <tr key={e.id}>
                      <td>
                        <div className="panel-est-tabla__nombre">
                          <div className="panel-est-tabla__avatar">
                            {e.nombre_estudiante?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="panel-est-tabla__nombre-texto">
                            {e.nombre_estudiante || '—'}
                          </span>
                        </div>
                      </td>
                      <td>{e.rut_estudiante || '—'}</td>
                      <td>{e.curso || '—'}</td>
                      <td>{e.colegio || '—'}</td>
                      <td>
                        {e.perfil?.nombre
                          ? <span style={{ color: 'var(--color-role-apoderado)' }}>{e.perfil.nombre}</span>
                          : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin asignar</span>}
                      </td>
                      <td>
                        <span className="panel-est-tabla__tel">
                          {e.perfil?.telefono || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
