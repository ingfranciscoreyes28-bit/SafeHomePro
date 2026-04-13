/**
 * LayoutApoderado
 *
 * Shell layout for the apoderado (parent/guardian) role. Renders a fixed
 * icon-only sidebar with tooltip labels, a sticky header with user info and
 * role badge, and an Outlet area for nested route content.
 *
 * Auth: reads `perfil` and `cerrarSesion` from useAuth().
 * Nav: uses NavLink for automatic active-class handling.
 * Mobile: sidebar slides in via hamburger toggle with a backdrop overlay.
 */

import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/LayoutApoderado.css'

/** Extract up to two initials from a full name string. */
function getInitials(nombre) {
  if (!nombre) return '?'
  const parts = nombre.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const NAV_ITEMS = [
  { to: '/apoderado/panel',  icon: '🏠', label: 'Panel' },
  { to: '/apoderado/pagos',  icon: '💰', label: 'Mis pagos' },
  { to: '/apoderado/perfil', icon: '👤', label: 'Mi perfil' },
]

export default function LayoutApoderado() {
  const { perfil, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const nombre = perfil?.nombre ?? ''
  const foto   = perfil?.foto ?? null

  function handleCerrarSesion() {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="layout-apoderado">

      {/* ── Backdrop (mobile) ── */}
      <div
        className={`layout-apoderado__overlay${sidebarOpen ? ' layout-apoderado__overlay--visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside
        className={`layout-apoderado__sidebar${sidebarOpen ? ' layout-apoderado__sidebar--open' : ''}`}
        aria-label="Navegacion apoderado"
      >
        {/* Brand */}
        <NavLink
          to="/apoderado/panel"
          className="layout-apoderado__sidebar-brand"
          aria-label="SafeHome — ir al panel"
          onClick={closeSidebar}
        >
          <span aria-hidden="true">🚌</span>
        </NavLink>

        {/* Primary nav */}
        <nav className="layout-apoderado__nav" aria-label="Menu principal">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <div key={to} className="layout-apoderado__nav-item-wrap">
              <NavLink
                to={to}
                end={to === '/apoderado/panel'}
                className={({ isActive }) =>
                  `layout-apoderado__nav-item${isActive ? ' layout-apoderado__nav-item--active' : ''}`
                }
                aria-label={label}
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                title={label}
                onClick={closeSidebar}
              >
                <span aria-hidden="true">{icon}</span>
              </NavLink>
              <span className="layout-apoderado__tooltip" aria-hidden="true">{label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom — logout */}
        <div className="layout-apoderado__nav-bottom">
          <div className="layout-apoderado__nav-divider" aria-hidden="true" />
          <div className="layout-apoderado__nav-item-wrap">
            <button
              type="button"
              className="layout-apoderado__nav-item layout-apoderado__nav-item--logout"
              onClick={handleCerrarSesion}
              aria-label="Cerrar sesion"
              title="Cerrar Sesion"
            >
              <span aria-hidden="true">🚪</span>
            </button>
            <span className="layout-apoderado__tooltip" aria-hidden="true">Cerrar Sesion</span>
          </div>
        </div>
      </aside>

      {/* ── Header ── */}
      <header className="layout-apoderado__header">
        <div className="layout-apoderado__header-left">
          {/* Hamburger (mobile only) */}
          <button
            type="button"
            className="layout-apoderado__hamburger"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label={sidebarOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={sidebarOpen}
          >
            <span aria-hidden="true">{sidebarOpen ? '✕' : '☰'}</span>
          </button>

          <span className="layout-apoderado__header-title">
            Safe<span>Home</span>
          </span>
        </div>

        <div className="layout-apoderado__header-right">
          {/* Role badge */}
          <span className="layout-apoderado__role-badge sh-badge sh-badge--apoderado">
            Apoderado
          </span>

          {/* User info */}
          <div className="layout-apoderado__user">
            <div
              className="layout-apoderado__avatar"
              aria-label={`Avatar de ${nombre}`}
            >
              {foto
                ? <img src={foto} alt={nombre} />
                : getInitials(nombre)
              }
            </div>
            {nombre && (
              <span className="layout-apoderado__user-name" title={nombre}>
                {nombre}
              </span>
            )}
          </div>

          {/* Logout (header, desktop) */}
          <button
            type="button"
            className="layout-apoderado__logout-btn"
            onClick={handleCerrarSesion}
            aria-label="Cerrar sesion"
          >
            <span aria-hidden="true">🚪</span>
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="layout-apoderado__main" id="main-content">
        <div className="layout-apoderado__content">
          <Outlet />
        </div>
      </main>

    </div>
  )
}
