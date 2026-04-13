/**
 * LayoutAdmin
 *
 * Shell layout for the admin role. Renders a fixed icon-only sidebar with
 * tooltip labels, a sticky header with user info and role badge, and an
 * Outlet area for nested route content.
 *
 * Auth: reads `perfil` and `cerrarSesion` from useAuth().
 * Nav: uses NavLink for automatic active-class handling.
 * Mobile: sidebar slides in via hamburger toggle with a backdrop overlay.
 */

import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/LayoutAdmin.css'

/** Extract up to two initials from a full name string. */
function getInitials(nombre) {
  if (!nombre) return '?'
  const parts = nombre.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const NAV_ITEMS = [
  { to: '/dashboard',   icon: '🏠', label: 'Dashboard' },
  { to: '/conductores', icon: '👨‍✈️', label: 'Conductores' },
  { to: '/furgones',    icon: '🚌', label: 'Furgones' },
  { to: '/apoderados',  icon: '👨‍👩‍👧', label: 'Apoderados' },
  { to: '/estudiantes', icon: '🧒', label: 'Estudiantes' },
  { to: '/pagos-admin', icon: '💰', label: 'Pagos' },
]

export default function LayoutAdmin() {
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
    <div className="layout-admin">

      {/* ── Backdrop (mobile) ── */}
      <div
        className={`layout-admin__overlay${sidebarOpen ? ' layout-admin__overlay--visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside
        className={`layout-admin__sidebar${sidebarOpen ? ' layout-admin__sidebar--open' : ''}`}
        aria-label="Navegacion administrador"
      >
        {/* Brand */}
        <NavLink
          to="/dashboard"
          className="layout-admin__sidebar-brand"
          aria-label="SafeHome — ir al dashboard"
          onClick={closeSidebar}
        >
          <span aria-hidden="true">🚌</span>
        </NavLink>

        {/* Primary nav */}
        <nav className="layout-admin__nav" aria-label="Menu principal">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <div key={to} className="layout-admin__nav-item-wrap">
              <NavLink
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `layout-admin__nav-item${isActive ? ' layout-admin__nav-item--active' : ''}`
                }
                aria-label={label}
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                title={label}
                onClick={closeSidebar}
              >
                <span aria-hidden="true">{icon}</span>
              </NavLink>
              <span className="layout-admin__tooltip" aria-hidden="true">{label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom — logout */}
        <div className="layout-admin__nav-bottom">
          <div className="layout-admin__nav-divider" aria-hidden="true" />
          <div className="layout-admin__nav-item-wrap">
            <button
              type="button"
              className="layout-admin__nav-item layout-admin__nav-item--logout"
              onClick={handleCerrarSesion}
              aria-label="Cerrar sesion"
              title="Cerrar Sesion"
            >
              <span aria-hidden="true">🚪</span>
            </button>
            <span className="layout-admin__tooltip" aria-hidden="true">Cerrar Sesion</span>
          </div>
        </div>
      </aside>

      {/* ── Header ── */}
      <header className="layout-admin__header">
        <div className="layout-admin__header-left">
          {/* Hamburger (mobile only) */}
          <button
            type="button"
            className="layout-admin__hamburger"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label={sidebarOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={sidebarOpen}
          >
            <span aria-hidden="true">{sidebarOpen ? '✕' : '☰'}</span>
          </button>

          <span className="layout-admin__header-title">
            Safe<span>Home</span>
          </span>
        </div>

        <div className="layout-admin__header-right">
          {/* Role badge */}
          <span className="layout-admin__role-badge sh-badge sh-badge--admin">
            Admin
          </span>

          {/* User info */}
          <div className="layout-admin__user">
            <div
              className="layout-admin__avatar"
              aria-label={`Avatar de ${nombre}`}
            >
              {foto
                ? <img src={foto} alt={nombre} />
                : getInitials(nombre)
              }
            </div>
            {nombre && (
              <span className="layout-admin__user-name" title={nombre}>
                {nombre}
              </span>
            )}
          </div>

          {/* Logout (header, desktop) */}
          <button
            type="button"
            className="layout-admin__logout-btn"
            onClick={handleCerrarSesion}
            aria-label="Cerrar sesion"
          >
            <span aria-hidden="true">🚪</span>
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="layout-admin__main" id="main-content">
        <div className="layout-admin__content">
          <Outlet />
        </div>
      </main>

    </div>
  )
}
