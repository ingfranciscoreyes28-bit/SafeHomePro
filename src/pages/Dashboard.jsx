import { useState, useEffect } from 'react'
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
// Spinner y Error
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
// PanelAdmin
// ============================================================

function PanelAdmin() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({})

  const acciones = [
    { icon: '👨‍✈️', iconClass: 'gold',   title: 'Gestionar conductores', desc: 'Agregar, editar o eliminar conductores' },
    { icon: '🚌', iconClass: 'blue',   title: 'Gestionar furgones',    desc: 'Vehículos y patentes registradas' },
    { icon: '📍', iconClass: 'green',  title: 'Ver rutas activas',     desc: 'Rutas en tiempo real' },
    { icon: '👨‍👩‍👧', iconClass: 'purple', title: 'Gestionar apoderados',  desc: 'Familias y estudiantes inscritos' },
    { icon: '📋', iconClass: 'gold',   title: 'Reportes',              desc: 'Historial de asistencia y pagos' },
    { icon: '🔔', iconClass: 'blue',   title: 'Notificaciones',        desc: 'Alertas y avisos de la plataforma' },
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

      if (furgones.error)    throw furgones.error
      if (conductores.error) throw conductores.error
      if (apoderados.error)  throw apoderados.error
      if (estudiantes.error) throw estudiantes.error

      setDashboardData({
        totalFurgones:    furgones.count    ?? 0,
        totalConductores: conductores.count ?? 0,
        totalApoderados:  apoderados.count  ?? 0,
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
    { icon: '🚌',    value: dashboardData.totalFurgones    ?? 0, label: 'Furgones activos', trend: 'Total registrados' },
    { icon: '👨‍✈️',  value: dashboardData.totalConductores ?? 0, label: 'Conductores',      trend: 'Total registrados' },
    { icon: '👨‍👩‍👧', value: dashboardData.totalApoderados  ?? 0, label: 'Apoderados',       trend: 'Total registrados' },
    { icon: '🧒',    value: dashboardData.totalEstudiantes ?? 0, label: 'Estudiantes',      trend: 'Total registrados' },
  ]

  if (loading) return <SpinnerSeccion />
  if (error)   return <MensajeError mensaje={error} />

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

// ============================================================
// Dashboard (solo admin)
// ============================================================

export default function Dashboard() {
  const { perfil, usuario } = useAuth()

  const nombreMostrar = perfil?.nombre ?? usuario?.email ?? 'Admin'
  const fechaHoy      = obtenerFechaHoy()
  const saludo        = obtenerSaludo()

  return (
    <div className="dashboard-main">

      {/* Hero saludo */}
      <div className="dashboard-hero">
        <p className="dashboard-hero__greeting">{fechaHoy}</p>
        <h1 className="dashboard-hero__title">
          {saludo}, {nombreMostrar.split(' ')[0]} 🛡️
        </h1>
        <div className="dashboard-hero__meta">
          <span className="sh-badge sh-badge--admin">🛡️ Admin</span>
          <span className="dashboard-hero__date">
            📅 {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <PanelAdmin />

    </div>
  )
}
