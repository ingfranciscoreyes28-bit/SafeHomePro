import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import '../styles/ApoderadosConductor.css'
import ChatWidget from '../components/ChatWidget'

function getInitials(nombre) {
  if (!nombre) return '?'
  const parts = nombre.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ApoderadosConductor() {
  const { perfil } = useAuth()

  const [apoderados, setApoderados] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState(null)
  const [busqueda, setBusqueda]     = useState('')
  const [sinFurgon, setSinFurgon]   = useState(false)

  const cargar = useCallback(async () => {
    if (!perfil?.id) return
    try {
      setCargando(true)
      setError(null)

      // 1) Obtener furgón del conductor
      const { data: furgonData, error: errFurgon } = await supabase
        .from('furgon')
        .select('id')
        .eq('id_conductor', perfil.id)
        .maybeSingle()

      if (errFurgon) throw errFurgon

      if (!furgonData) {
        setSinFurgon(true)
        setApoderados([])
        return
      }

      setSinFurgon(false)

      // 2) Obtener estudiantes con datos del apoderado
      const { data: estudiantes, error: errEst } = await supabase
        .from('estudiante')
        .select('id, nombre_estudiante, perfil!id_apoderado(id, nombre, rut, telefono, foto)')
        .eq('id_furgon', furgonData.id)
        .order('nombre_estudiante')

      if (errEst) throw errEst

      // 3) Agrupar estudiantes por apoderado (deduplicar)
      const mapa = new Map()
      for (const est of estudiantes ?? []) {
        const apo = est.perfil
        if (!apo) continue
        if (!mapa.has(apo.id)) {
          mapa.set(apo.id, { ...apo, estudiantes: [] })
        }
        mapa.get(apo.id).estudiantes.push(est.nombre_estudiante)
      }

      setApoderados([...mapa.values()])
    } catch (err) {
      console.error('Error al cargar apoderados:', err)
      setError('No se pudieron cargar los apoderados. Intenta recargar la página.')
    } finally {
      setCargando(false)
    }
  }, [perfil?.id])

  useEffect(() => { cargar() }, [cargar])

  const filtrados = apoderados.filter(a => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return (
      a.nombre?.toLowerCase().includes(q) ||
      a.rut?.toLowerCase().includes(q) ||
      a.telefono?.toLowerCase().includes(q)
    )
  })

  // ── Render ──────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="panel-apo">
        <div className="panel-apo__loading">
          <span className="sh-spinner sh-spinner--dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p>Cargando apoderados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel-apo">

      <div className="panel-apo__header">
        <div>
          <h1 className="panel-apo__titulo">👨‍👩‍👧 Apoderados</h1>
          <p className="panel-apo__sub">
            {sinFurgon
              ? 'Sin furgón asignado'
              : `${apoderados.length} apoderado${apoderados.length !== 1 ? 's' : ''} de tu furgón`}
          </p>
        </div>
      </div>

      {error && (
        <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-5)' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Sin furgón */}
      {sinFurgon && !error && (
        <div className="panel-apo__empty">
          <div className="panel-apo__empty-icon">🚐</div>
          <p className="panel-apo__empty-titulo">Sin furgón asignado</p>
          <p className="panel-apo__empty-msg">
            No tienes un furgón asignado aún. Contacta al administrador.
          </p>
        </div>
      )}

      {/* Con furgón */}
      {!sinFurgon && (
        <>
          <div className="panel-apo__busqueda">
            <input
              type="text"
              className="sh-input"
              placeholder="Buscar por nombre, RUT o teléfono..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </div>

          {filtrados.length === 0 ? (
            <div className="panel-apo__empty">
              <div className="panel-apo__empty-icon">👨‍👩‍👧</div>
              <p className="panel-apo__empty-titulo">Sin resultados</p>
              <p className="panel-apo__empty-msg">
                {busqueda
                  ? 'No se encontraron apoderados que coincidan con la búsqueda.'
                  : 'Aún no hay apoderados asignados a tu furgón.'}
              </p>
            </div>
          ) : (
            <div className="panel-apo-tabla-wrapper">
              <table className="panel-apo-tabla">
                <thead>
                  <tr>
                    <th>Apoderado</th>
                    <th>RUT</th>
                    <th>Teléfono</th>
                    <th>Estudiantes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div className="panel-apo-tabla__nombre">
                          <div className="panel-apo-tabla__avatar">
                            {a.foto
                              ? <img src={a.foto} alt={a.nombre} />
                              : getInitials(a.nombre)}
                          </div>
                          <span className="panel-apo-tabla__nombre-texto">
                            {a.nombre || '—'}
                          </span>
                        </div>
                      </td>
                      <td>{a.rut || '—'}</td>
                      <td>
                        <span className="panel-apo-tabla__tel">
                          {a.telefono || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="panel-apo-tabla__estudiantes">
                          {a.estudiantes.map((nombre, i) => (
                            <span key={i} className="panel-apo-tabla__chip">
                              {nombre}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ChatWidget />
    </div>
  )
}
