import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import '../styles/global.css'
import '../styles/Dashboard.css'

// ============================================================
// Helpers
// ============================================================

function obtenerIniciales(nombre) {
  if (!nombre) return '?'
  const partes = nombre.trim().split(' ')
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

function obtenerFechaHoy() {
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function obtenerSaludo() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// ============================================================
// Spinner de carga (respeta diseño oscuro/dorado)
// ============================================================

function SpinnerSeccion() {
  return (
    <div className="dashboard-loading" style={{ minHeight: '200px' }}>
      <div className="dashboard-loading__spinner" aria-hidden="true" />
      <p className="dashboard-loading__text">Cargando datos...</p>
    </div>
  )
}

function MensajeError({ mensaje }) {
  return (
    <div
      style={{
        padding: 'var(--space-6)',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 'var(--radius-lg)',
        color: '#fca5a5',
        textAlign: 'center',
        fontSize: '0.9375rem',
      }}
    >
      ⚠️ {mensaje}
    </div>
  )
}

// ============================================================
// Sub-componentes por rol
// ============================================================

function PanelAdmin({ perfil }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({})

  const acciones = [
    { icon: '👨‍✈️', iconClass: 'gold', title: 'Gestionar conductores', desc: 'Agregar, editar o eliminar conductores' },
    { icon: '🚌', iconClass: 'blue', title: 'Gestionar furgones', desc: 'Vehículos y patentes registradas' },
    { icon: '📍', iconClass: 'green', title: 'Ver rutas activas', desc: 'Rutas en tiempo real' },
    { icon: '👨‍👩‍👧', iconClass: 'purple', title: 'Gestionar apoderados', desc: 'Familias y estudiantes inscritos' },
    { icon: '📋', iconClass: 'gold', title: 'Reportes', desc: 'Historial de asistencia y pagos' },
    { icon: '🔔', iconClass: 'blue', title: 'Notificaciones', desc: 'Alertas y avisos de la plataforma' },
  ]

  useEffect(() => {
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    try {
      setLoading(true)
      setError(null)

      const [furgones, conductores, apoderados, estudiantes] = await Promise.all([
        supabase.from('furgon').select('*', { count: 'exact', head: true }),
        supabase.from('perfil').select('*', { count: 'exact', head: true }).eq('tipo_usuario', 'conductor'),
        supabase.from('perfil').select('*', { count: 'exact', head: true }).eq('tipo_usuario', 'apoderado'),
        supabase.from('estudiante').select('*', { count: 'exact', head: true }),
      ])

      if (furgones.error) throw furgones.error
      if (conductores.error) throw conductores.error
      if (apoderados.error) throw apoderados.error
      if (estudiantes.error) throw estudiantes.error

      setDashboardData({
        totalFurgones: furgones.count ?? 0,
        totalConductores: conductores.count ?? 0,
        totalApoderados: apoderados.count ?? 0,
        totalEstudiantes: estudiantes.count ?? 0,
      })
    } catch (err) {
      console.error('Error al cargar datos de admin:', err)
      setError('No se pudieron cargar las estadísticas. Intenta recargar la página.')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { icon: '🚌', value: dashboardData.totalFurgones ?? 0, label: 'Furgones activos', trend: 'Total registrados' },
    { icon: '👨‍✈️', value: dashboardData.totalConductores ?? 0, label: 'Conductores', trend: 'Total registrados' },
    { icon: '👨‍👩‍👧', value: dashboardData.totalApoderados ?? 0, label: 'Apoderados', trend: 'Total registrados' },
    { icon: '🧒', value: dashboardData.totalEstudiantes ?? 0, label: 'Estudiantes', trend: 'Total registrados' },
  ]

  if (loading) return <SpinnerSeccion />
  if (error) return <MensajeError mensaje={error} />

  return (
    <>
      {/* Estadísticas */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">📊 Resumen general</h2>
        </div>
        <div className="dashboard-stats-grid">
          {stats.map((s, i) => (
            <div className="dashboard-stat-card" key={i}>
              <div className="dashboard-stat-card__icon">{s.icon}</div>
              <div className="dashboard-stat-card__value">{s.value}</div>
              <div className="dashboard-stat-card__label">{s.label}</div>
              <div className="dashboard-stat-card__trend">↑ {s.trend}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">⚡ Acciones rápidas</h2>
        </div>
        <div className="dashboard-actions-grid">
          {acciones.map((a, i) => (
            <div className="dashboard-action-card" key={i}>
              <div className={`dashboard-action-card__icon dashboard-action-card__icon--${a.iconClass}`}>
                {a.icon}
              </div>
              <div>
                <div className="dashboard-action-card__title">{a.title}</div>
                <div className="dashboard-action-card__desc">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function PanelConductor({ perfil, usuario }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({ furgon: null, estudiantes: [] })
  const [asistencia, setAsistencia] = useState({})

  useEffect(() => {
    if (usuario?.id) fetchConductorData()
  }, [usuario?.id])

  async function fetchConductorData() {
    try {
      setLoading(true)
      setError(null)

      // Obtener furgón asignado al conductor
      const { data: furgonData, error: furgonError } = await supabase
        .from('furgon')
        .select('*')
        .eq('id_conductor', usuario.id)
        .single()

      if (furgonError && furgonError.code !== 'PGRST116') throw furgonError

      let estudiantesData = []
      if (furgonData?.id) {
        const { data, error: estudiantesError } = await supabase
          .from('estudiante')
          .select('*')
          .eq('id_furgon', furgonData.id)

        if (estudiantesError) throw estudiantesError
        estudiantesData = data ?? []
      }

      setDashboardData({
        furgon: furgonData ?? null,
        estudiantes: estudiantesData,
      })
    } catch (err) {
      console.error('Error al cargar datos de conductor:', err)
      setError('No se pudieron cargar los datos de tu ruta. Intenta recargar la página.')
    } finally {
      setLoading(false)
    }
  }

  function toggleAsistencia(id) {
    setAsistencia(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) return <SpinnerSeccion />
  if (error) return <MensajeError mensaje={error} />

  const { furgon, estudiantes } = dashboardData
  const totalPresentes = Object.values(asistencia).filter(Boolean).length

  return (
    <>
      {/* Info de la ruta */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">🗺️ Tu ruta de hoy</h2>
        </div>
        {furgon ? (
          <div className="dashboard-info-card">
            <div className="dashboard-info-card__header">
              <span className="dashboard-info-card__header-icon">🚌</span>
              <span className="dashboard-info-card__header-title">
                {furgon.nombre ?? 'Furgón asignado'}
              </span>
              <span className="dashboard-info-card__status dashboard-info-card__status--active">
                <span className="dashboard-info-card__status-dot dashboard-info-card__status-dot--pulse" />
                Activa
              </span>
            </div>
            <div className="dashboard-info-card__body">
              <div className="dashboard-data-rows">
                <div className="dashboard-data-row">
                  <span className="dashboard-data-row__label">
                    <span className="dashboard-data-row__label-icon">🚗</span>
                    Vehículo
                  </span>
                  <span className="dashboard-data-row__value">
                    {furgon.tipo ?? 'Minibús'} — {furgon.patente ?? 'Sin patente'}
                  </span>
                </div>
                {furgon.colegio && (
                  <div className="dashboard-data-row">
                    <span className="dashboard-data-row__label">
                      <span className="dashboard-data-row__label-icon">🏫</span>
                      Colegio
                    </span>
                    <span className="dashboard-data-row__value">{furgon.colegio}</span>
                  </div>
                )}
                {furgon.hora_salida && (
                  <div className="dashboard-data-row">
                    <span className="dashboard-data-row__label">
                      <span className="dashboard-data-row__label-icon">⏰</span>
                      Hora de salida
                    </span>
                    <span className="dashboard-data-row__value">{furgon.hora_salida} hrs</span>
                  </div>
                )}
                <div className="dashboard-data-row">
                  <span className="dashboard-data-row__label">
                    <span className="dashboard-data-row__label-icon">🧒</span>
                    Estudiantes asignados
                  </span>
                  <span className="dashboard-data-row__value" style={{ color: 'var(--color-primary)' }}>
                    {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: 'var(--space-6)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
            }}
          >
            No tienes un furgón asignado por el momento.
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="dashboard-section">
        <div className="dashboard-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__icon">🧒</div>
            <div className="dashboard-stat-card__value">{estudiantes.length}</div>
            <div className="dashboard-stat-card__label">Estudiantes asignados</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__icon">✅</div>
            <div className="dashboard-stat-card__value">{totalPresentes}</div>
            <div className="dashboard-stat-card__label">Marcados hoy</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__icon">⏳</div>
            <div className="dashboard-stat-card__value">{estudiantes.length - totalPresentes}</div>
            <div className="dashboard-stat-card__label">Pendientes</div>
          </div>
        </div>
      </div>

      {/* Lista de estudiantes */}
      {estudiantes.length > 0 && (
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">🧒 Lista de estudiantes</h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Toca el círculo para marcar asistencia
            </span>
          </div>
          <div className="dashboard-student-list">
            {estudiantes.map(est => (
              <div className="dashboard-student-item" key={est.id}>
                <div className="dashboard-student-item__avatar">
                  {obtenerIniciales(est.nombre)}
                </div>
                <div className="dashboard-student-item__info">
                  <div className="dashboard-student-item__name">{est.nombre}</div>
                  <div className="dashboard-student-item__meta">
                    {est.curso ? `${est.curso}` : 'Sin curso'}{est.direccion ? ` · ${est.direccion}` : ''}
                  </div>
                </div>
                <button
                  className={`dashboard-student-item__check${asistencia[est.id] ? ' dashboard-student-item__check--checked' : ''}`}
                  onClick={() => toggleAsistencia(est.id)}
                  aria-label={`Marcar asistencia de ${est.nombre}`}
                  title={asistencia[est.id] ? 'Presente' : 'Marcar como presente'}
                >
                  {asistencia[est.id] ? '✅' : '○'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function PanelApoderado({ perfil, usuario }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({ estudiantes: [], furgon: null, conductor: null })

  useEffect(() => {
    if (usuario?.id) fetchApoderadoData()
  }, [usuario?.id])

  async function fetchApoderadoData() {
    try {
      setLoading(true)
      setError(null)

      // Obtener estudiantes del apoderado
      const { data: estudiantesData, error: estudiantesError } = await supabase
        .from('estudiante')
        .select('*')
        .eq('id_apoderado', usuario.id)

      if (estudiantesError) throw estudiantesError

      const estudiantes = estudiantesData ?? []
      let furgonData = null
      let conductorData = null

      // Si tiene estudiantes y alguno tiene furgón asignado, buscarlo
      const idFurgon = estudiantes.find(e => e.id_furgon)?.id_furgon
      if (idFurgon) {
        const { data: furgon, error: furgonError } = await supabase
          .from('furgon')
          .select('*')
          .eq('id', idFurgon)
          .single()

        if (furgonError && furgonError.code !== 'PGRST116') throw furgonError
        furgonData = furgon ?? null

        // Obtener datos del conductor si el furgón tiene uno asignado
        if (furgonData?.id_conductor) {
          const { data: conductor, error: conductorError } = await supabase
            .from('perfil')
            .select('*')
            .eq('id', furgonData.id_conductor)
            .single()

          if (conductorError && conductorError.code !== 'PGRST116') throw conductorError
          conductorData = conductor ?? null
        }
      }

      setDashboardData({ estudiantes, furgon: furgonData, conductor: conductorData })
    } catch (err) {
      console.error('Error al cargar datos de apoderado:', err)
      setError('No se pudieron cargar los datos de tus estudiantes. Intenta recargar la página.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <SpinnerSeccion />
  if (error) return <MensajeError mensaje={error} />

  const { estudiantes, furgon, conductor } = dashboardData

  return (
    <>
      {/* Info del conductor */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">👨‍✈️ Tu conductor asignado</h2>
        </div>
        {furgon ? (
          <div className="dashboard-info-card">
            <div className="dashboard-info-card__header">
              <span className="dashboard-info-card__header-icon">🚌</span>
              <span className="dashboard-info-card__header-title">
                {conductor?.nombre ?? 'Conductor'} — {furgon.nombre ?? 'Furgón asignado'}
              </span>
              <span className="dashboard-info-card__status dashboard-info-card__status--active">
                <span className="dashboard-info-card__status-dot dashboard-info-card__status-dot--pulse" />
                En ruta
              </span>
            </div>
            <div className="dashboard-info-card__body">
              <div className="dashboard-data-rows">
                {conductor?.telefono && (
                  <div className="dashboard-data-row">
                    <span className="dashboard-data-row__label">
                      <span className="dashboard-data-row__label-icon">📞</span>
                      Teléfono
                    </span>
                    <span className="dashboard-data-row__value">{conductor.telefono}</span>
                  </div>
                )}
                <div className="dashboard-data-row">
                  <span className="dashboard-data-row__label">
                    <span className="dashboard-data-row__label-icon">🚗</span>
                    Vehículo
                  </span>
                  <span className="dashboard-data-row__value">
                    {furgon.tipo ?? 'Minibús'} — Patente {furgon.patente ?? 'Sin patente'}
                  </span>
                </div>
                {furgon.hora_salida && (
                  <div className="dashboard-data-row">
                    <span className="dashboard-data-row__label">
                      <span className="dashboard-data-row__label-icon">⏰</span>
                      Hora de recogida
                    </span>
                    <span className="dashboard-data-row__value">{furgon.hora_salida} hrs (estimado)</span>
                  </div>
                )}
                {furgon.colegio && (
                  <div className="dashboard-data-row">
                    <span className="dashboard-data-row__label">
                      <span className="dashboard-data-row__label-icon">🏫</span>
                      Colegio
                    </span>
                    <span className="dashboard-data-row__value">{furgon.colegio}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: 'var(--space-6)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
            }}
          >
            No tienes un furgón asignado por el momento.
          </div>
        )}
      </div>

      {/* Estado de los estudiantes */}
      {estudiantes.length > 0 && (
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">🧒 Estado de tus hijos hoy</h2>
          </div>
          <div
            className="dashboard-stats-grid"
            style={{ gridTemplateColumns: estudiantes.length === 1 ? 'repeat(2, 1fr)' : `repeat(${Math.min(estudiantes.length, 3)}, 1fr)` }}
          >
            {estudiantes.map(est => (
              <div className="dashboard-stat-card" key={est.id}>
                <div className="dashboard-stat-card__icon">🧒</div>
                <div className="dashboard-stat-card__value" style={{ fontSize: '1.25rem' }}>
                  {est.nombre?.split(' ')[0] ?? 'Estudiante'}
                </div>
                <div className="dashboard-stat-card__label">
                  {est.nombre} {est.curso ? `— ${est.curso}` : ''}
                </div>
                <div className="dashboard-stat-card__trend">
                  {est.id_furgon ? 'Con furgón asignado' : 'Sin furgón asignado'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin estudiantes */}
      {estudiantes.length === 0 && (
        <div className="dashboard-section">
          <div
            style={{
              padding: 'var(--space-6)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
            }}
          >
            No tienes estudiantes registrados aún.
          </div>
        </div>
      )}
    </>
  )
}

// ============================================================
// Componente principal Dashboard
// ============================================================

export default function Dashboard() {
  const { perfil, usuario, cargando, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!cargando && !usuario) {
      navigate('/login')
    }
  }, [usuario, cargando, navigate])

  async function handleLogout() {
    await cerrarSesion()
    navigate('/login')
  }

  // Pantalla de carga de auth
  if (cargando) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__spinner" aria-hidden="true" />
        <p className="dashboard-loading__text">Cargando tu panel...</p>
      </div>
    )
  }

  // No hay usuario — esperar redirect del useEffect
  if (!usuario) return null

  const tipoUsuario = perfil?.tipo_usuario ?? 'apoderado'
  const nombreMostrar = perfil?.nombre ?? usuario?.email ?? 'Usuario'
  const fechaHoy = obtenerFechaHoy()
  const saludo = obtenerSaludo()

  const rolesConfig = {
    admin: {
      badge: <span className="sh-badge sh-badge--admin">🛡️ Admin</span>,
      emoji: '🛡️',
    },
    conductor: {
      badge: <span className="sh-badge sh-badge--conductor">🚌 Conductor</span>,
      emoji: '🚌',
    },
    apoderado: {
      badge: <span className="sh-badge sh-badge--apoderado">👨‍👩‍👧 Apoderado</span>,
      emoji: '👨‍👩‍👧',
    },
  }

  const rolConfig = rolesConfig[tipoUsuario] ?? rolesConfig.apoderado

  return (
    <div className="dashboard-layout">

      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__brand">
          <div className="dashboard-header__logo">🚌</div>
          <span className="dashboard-header__name">
            Safe<span>Home</span>
          </span>
        </div>

        <div className="dashboard-header__right">
          <div className="dashboard-header__user">
            <div className="dashboard-header__avatar" aria-hidden="true">
              {obtenerIniciales(nombreMostrar)}
            </div>
            <div className="dashboard-header__info">
              <span className="dashboard-header__nombre">{nombreMostrar}</span>
              {rolConfig.badge}
            </div>
          </div>

          <button
            className="dashboard-logout-btn"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <span>🚪</span>
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="dashboard-main">

        {/* Hero saludo */}
        <div className="dashboard-hero">
          <p className="dashboard-hero__greeting">{fechaHoy}</p>
          <h1 className="dashboard-hero__title">
            {saludo}, {nombreMostrar.split(' ')[0]} {rolConfig.emoji}
          </h1>
          <div className="dashboard-hero__meta">
            {rolConfig.badge}
            <span className="dashboard-hero__date">
              📅 {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Panel según rol */}
        {tipoUsuario === 'admin' && <PanelAdmin perfil={perfil} />}
        {tipoUsuario === 'conductor' && <PanelConductor perfil={perfil} usuario={usuario} />}
        {tipoUsuario === 'apoderado' && <PanelApoderado perfil={perfil} usuario={usuario} />}

      </main>
    </div>
  )
}
