import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
// Sub-componentes por rol
// ============================================================

function PanelAdmin({ perfil }) {
  const stats = [
    { icon: '🚌', value: '8', label: 'Furgones activos', trend: '+1 este mes' },
    { icon: '👨‍✼', value: '8', label: 'Conductores', trend: 'Sin cambios' },
    { icon: '👨‍👩‍👧', value: '47', label: 'Apoderados', trend: '+3 esta semana' },
    { icon: '🧒', value: '64', label: 'Estudiantes', trend: '+5 esta semana' },
  ]

  const acciones = [
    { icon: '👨‍✼', iconClass: 'gold', title: 'Gestionar conductores', desc: 'Agregar, editar o eliminar conductores' },
    { icon: '🚌', iconClass: 'blue', title: 'Gestionar furgones', desc: 'Vehículos y patentes registradas' },
    { icon: '📍', iconClass: 'green', title: 'Ver rutas activas', desc: 'Rutas en tiempo real' },
    { icon: '👨‍👩‍👧', iconClass: 'purple', title: 'Gestionar apoderados', desc: 'Familias y estudiantes inscritos' },
    { icon: '📋', iconClass: 'gold', title: 'Reportes', desc: 'Historial de asistencia y pagos' },
    { icon: '🔔', iconClass: 'blue', title: 'Notificaciones', desc: 'Alertas y avisos de la plataforma' },
  ]

  const rutasRecientes = [
    { nombre: 'Ruta Norte — Las Condes', conductor: 'Carlos Pérez', estado: 'En curso' },
    { nombre: 'Ruta Sur — La Florida', conductor: 'Ana Torres', estado: 'Completada' },
    { nombre: 'Ruta Centro — Providencia', conductor: 'Luis Mora', estado: 'En curso' },
  ]

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

      {/* Rutas activas */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">🚦 Rutas de hoy</h2>
        </div>
        <div className="dashboard-table-card">
          <div className="dashboard-table-card__header">
            <span className="dashboard-table-card__title">📋 Listado de rutas</span>
            <span className="sh-badge sh-badge--conductor">
              <span className="dashboard-info-card__status-dot dashboard-info-card__status-dot--pulse" />
              En tiempo real
            </span>
          </div>
          {rutasRecientes.map((r, i) => (
            <div className="dashboard-table-row" key={i}>
              <span className="dashboard-table-row__icon">🚌</span>
              <span className="dashboard-table-row__primary">{r.nombre}</span>
              <span className="dashboard-table-row__secondary" style={{ color: 'var(--color-text-secondary)', marginRight: 'var(--space-4)' }}>
                {r.conductor}
              </span>
              <span
                className={`dashboard-info-card__status ${
                  r.estado === 'En curso'
                    ? 'dashboard-info-card__status--active'
                    : 'dashboard-info-card__status--inactive'
                }`}
              >
                <span className="dashboard-info-card__status-dot" />
                {r.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function PanelConductor({ perfil }) {
  const [asistencia, setAsistencia] = useState({})

  const estudiantes = [
    { id: 1, nombre: 'Sofía Ramírez', curso: '3° Básico', direccion: 'Av. Las Flores 123' },
    { id: 2, nombre: 'Diego Muñoz', curso: '5° Básico', direccion: 'Calle Los Pinos 45' },
    { id: 3, nombre: 'Valentina López', curso: '1° Básico', direccion: 'Pasaje El Roble 8' },
    { id: 4, nombre: 'Matías Soto', curso: '4° Básico', direccion: 'Av. Principal 200' },
    { id: 5, nombre: 'Isidora Vega', curso: '2° Básico', direccion: 'Los Cerezos 77' },
  ]

  function toggleAsistencia(id) {
    setAsistencia(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const totalPresentes = Object.values(asistencia).filter(Boolean).length

  return (
    <>
      {/* Info de la ruta */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">🗺️ Tu ruta de hoy</h2>
        </div>
        <div className="dashboard-info-card">
          <div className="dashboard-info-card__header">
            <span className="dashboard-info-card__header-icon">🚌</span>
            <span className="dashboard-info-card__header-title">Ruta Norte — Las Condes</span>
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
                <span className="dashboard-data-row__value">Minibús — BCZR90</span>
              </div>
              <div className="dashboard-data-row">
                <span className="dashboard-data-row__label">
                  <span className="dashboard-data-row__label-icon">🏫</span>
                  Colegio
                </span>
                <span className="dashboard-data-row__value">Colegio San Patricio</span>
              </div>
              <div className="dashboard-data-row">
                <span className="dashboard-data-row__label">
                  <span className="dashboard-data-row__label-icon">⏰</span>
                  Hora de salida
                </span>
                <span className="dashboard-data-row__value">07:30 hrs</span>
              </div>
              <div className="dashboard-data-row">
                <span className="dashboard-data-row__label">
                  <span className="dashboard-data-row__label-icon">📍</span>
                  Próxima parada
                </span>
                <span className="dashboard-data-row__value" style={{ color: 'var(--color-primary)' }}>
                  Av. Las Flores 123
                </span>
              </div>
            </div>
          </div>
        </div>
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
                  {est.curso} · {est.direccion}
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
    </>
  )
}

function PanelApoderado({ perfil }) {
  const notificaciones = [
    {
      id: 1,
      icon: '🚌',
      title: 'El furgón está en camino',
      text: 'El conductor Carlos Pérez salió hace 10 minutos. Llegará en aproximadamente 15 min.',
      time: 'Hace 10 min',
      noLeida: true,
    },
    {
      id: 2,
      icon: '✅',
      title: 'Sofía abordó el furgón',
      text: 'Tu hija Sofía Ramírez fue registrada a bordo del furgón a las 07:45 hrs.',
      time: 'Hoy 07:45',
      noLeida: true,
    },
    {
      id: 3,
      icon: '🏫',
      title: 'Llegada al colegio confirmada',
      text: 'El furgón llegó al Colegio San Patricio con todos los estudiantes.',
      time: 'Hoy 08:10',
      noLeida: false,
    },
    {
      id: 4,
      icon: '📋',
      title: 'Recordatorio de pago mensual',
      text: 'El pago del mes de Abril vence el día 15. Monto: $45.000.',
      time: 'Ayer',
      noLeida: false,
    },
  ]

  return (
    <>
      {/* Info del conductor */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">👨‍✼ Tu conductor asignado</h2>
        </div>
        <div className="dashboard-info-card">
          <div className="dashboard-info-card__header">
            <span className="dashboard-info-card__header-icon">🚌</span>
            <span className="dashboard-info-card__header-title">Carlos Pérez — Ruta Norte</span>
            <span className="dashboard-info-card__status dashboard-info-card__status--active">
              <span className="dashboard-info-card__status-dot dashboard-info-card__status-dot--pulse" />
              En ruta
            </span>
          </div>
          <div className="dashboard-info-card__body">
            <div className="dashboard-data-rows">
              <div className="dashboard-data-row">
                <span className="dashboard-data-row__label">
                  <span className="dashboard-data-row__label-icon">📞</span>
                  Teléfono
                </span>
                <span className="dashboard-data-row__value">+56 9 8765 4321</span>
              </div>
              <div className="dashboard-data-row">
                <span className="dashboard-data-row__label">
                  <span className="dashboard-data-row__label-icon">🚗</span>
                  Vehículo
                </span>
                <span className="dashboard-data-row__value">Minibús — Patente BCZR90</span>
              </div>
              <div className="dashboard-data-row">
                <span className="dashboard-data-row__label">
                  <span className="dashboard-data-row__label-icon">⏰</span>
                  Hora de recogida
                </span>
                <span className="dashboard-data-row__value">07:30 hrs (estimado)</span>
              </div>
              <div className="dashboard-data-row">
                <span className="dashboard-data-row__label">
                  <span className="dashboard-data-row__label-icon">📍</span>
                  Ubicación actual
                </span>
                <span className="dashboard-data-row__value" style={{ color: 'var(--color-primary)' }}>
                  Av. Las Flores · En camino
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del estudiante */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">🧒 Estado de tu hijo/a hoy</h2>
        </div>
        <div className="dashboard-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__icon">✅</div>
            <div className="dashboard-stat-card__value" style={{ fontSize: '1.25rem' }}>A bordo</div>
            <div className="dashboard-stat-card__label">Sofía Ramírez — 3° Básico</div>
            <div className="dashboard-stat-card__trend">Registrada a las 07:45</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-card__icon">🏫</div>
            <div className="dashboard-stat-card__value" style={{ fontSize: '1.25rem' }}>Llegó</div>
            <div className="dashboard-stat-card__label">Colegio San Patricio</div>
            <div className="dashboard-stat-card__trend">Llegada a las 08:10</div>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">🔔 Notificaciones recientes</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 500, cursor: 'pointer' }}>
            Ver todas
          </span>
        </div>
        <div className="dashboard-notifications">
          {notificaciones.map(n => (
            <div
              key={n.id}
              className={`dashboard-notification${n.noLeida ? ' dashboard-notification--unread' : ''}`}
            >
              <span className="dashboard-notification__icon">{n.icon}</span>
              <div className="dashboard-notification__content">
                <div className="dashboard-notification__title">{n.title}</div>
                <div className="dashboard-notification__text">{n.text}</div>
              </div>
              <span className="dashboard-notification__time">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
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

  // Pantalla de carga
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
        {tipoUsuario === 'conductor' && <PanelConductor perfil={perfil} />}
        {tipoUsuario === 'apoderado' && <PanelApoderado perfil={perfil} />}

      </main>
    </div>
  )
}
