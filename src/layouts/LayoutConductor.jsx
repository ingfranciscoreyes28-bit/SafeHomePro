/**
 * LayoutConductor
 *
 * Shell layout for the conductor (driver) role. Renders a fixed icon-only
 * sidebar with tooltip labels, a sticky header with user info and role badge,
 * and an Outlet area for nested route content.
 *
 * Auth: reads `perfil` and `cerrarSesion` from useAuth().
 * Nav: uses NavLink for automatic active-class handling.
 * Mobile: sidebar slides in via hamburger toggle with a backdrop overlay.
 */

import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/LayoutConductor.css'

/** Extract up to two initials from a full name string. */
function getInitials(nombre) {
  if (!nombre) return '?'
  const parts = nombre.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const NAV_ITEMS = [
  { to: '/conductor/panel',       icon: '🏠', label: 'Panel' },
  { to: '/conductor/estudiantes', icon: '🧒', label: 'Mis estudiantes' },
  { to: '/conductor/apoderados',  icon: '👨‍👩‍👧', label: 'Apoderados' },
  { to: '/conductor/perfil',      icon: '👤', label: 'Mi perfil' },
]

export default function LayoutConductor() {
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
    <div className="layout-conductor">

      {/* ── Backdrop (mobile) ── */}
      <div
        className={`layout-conductor__overlay${sidebarOpen ? ' layout-conductor__overlay--visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside
        className={`layout-conductor__sidebar${sidebarOpen ? ' layout-conductor__sidebar--open' : ''}`}
        aria-label="Navegacion conductor"
      >
        {/* Brand */}
        <NavLink
          to="/conductor/panel"
          className="layout-conductor__sidebar-brand"
          aria-label="SafeHome — ir al panel"
          onClick={closeSidebar}
        >
          <span aria-hidden="true">🚌</span>
        </NavLink>

        {/* Primary nav */}
        <nav className="layout-conductor__nav" aria-label="Menu principal">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <div key={to} className="layout-conductor__nav-item-wrap">
              <NavLink
                to={to}
                end={to === '/conductor/panel'}
                className={({ isActive }) =>
                  `layout-conductor__nav-item${isActive ? ' layout-conductor__nav-item--active' : ''}`
                }
                aria-label={label}
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                title={label}
                onClick={closeSidebar}
              >
                <span aria-hidden="true">{icon}</span>
              </NavLink>
              <span className="layout-conductor__tooltip" aria-hidden="true">{label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom — logout */}
        <div className="layout-conductor__nav-bottom">
          <div className="layout-conductor__nav-divider" aria-hidden="true" />
          <div className="layout-conductor__nav-item-wrap">
            <button
              type="button"
              className="layout-conductor__nav-item layout-conductor__nav-item--logout"
              onClick={handleCerrarSesion}
              aria-label="Cerrar sesion"
              title="Cerrar Sesion"
            >
              <span aria-hidden="true">🚪</span>
            </button>
            <span className="layout-conductor__tooltip" aria-hidden="true">Cerrar Sesion</span>
          </div>
        </div>
      </aside>

      {/* ── Header ── */}
      <header className="layout-conductor__header">
        <div className="layout-conductor__header-left">
          {/* Hamburger (mobile only) */}
          <button
            type="button"
            className="layout-conductor__hamburger"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label={sidebarOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={sidebarOpen}
          >
            <span aria-hidden="true">{sidebarOpen ? '✕' : '☰'}</span>
          </button>

          <span className="layout-conductor__header-title">
            Safe<span>Home</span>
          </span>
        </div>

        <div className="layout-conductor__header-right">
          {/* Role badge */}
          <span className="layout-conductor__role-badge sh-badge sh-badge--conductor">
            Conductor
          </span>

          {/* User info */}
          <div className="layout-conductor__user">
            <div
              className="layout-conductor__avatar"
              aria-label={`Avatar de ${nombre}`}
            >
              {foto
                ? <img src={foto} alt={nombre} />
                : getInitials(nombre)
              }
            </div>
            {nombre && (
              <span className="layout-conductor__user-name" title={nombre}>
                {nombre}
              </span>
            )}
          </div>

          {/* Logout (header, desktop) */}
          <button
            type="button"
            className="layout-conductor__logout-btn"
            onClick={handleCerrarSesion}
            aria-label="Cerrar sesion"
          >
            <span aria-hidden="true">🚪</span>
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="layout-conductor__main" id="main-content">
        <div className="layout-conductor__content">
          <Outlet />
        </div>
      </main>

    </div>
  )
}
