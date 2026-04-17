import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Páginas públicas
import Login from './pages/Login'
import Registro from './pages/Registro'
import SolicitudPendiente from './pages/SolicitudPendiente'

// Layouts
import LayoutAdmin from './layouts/LayoutAdmin'
import LayoutConductor from './layouts/LayoutConductor'
import LayoutApoderado from './layouts/LayoutApoderado'

// Páginas admin
import Dashboard      from './pages/Dashboard'
import Conductores    from './pages/Conductores'
import Furgones       from './pages/Furgones'
import Apoderados     from './pages/Apoderados'
import Estudiantes    from './pages/Estudiantes'
import PagosAdmin     from './pages/PagosAdmin'

// Páginas conductor
import PanelRuta              from './pages/PanelRuta'
import PanelEstudiantes       from './pages/PanelEstudiantes'
import ApoderadosConductor    from './pages/ApoderadosConductor'
import Perfil                 from './pages/Perfil'

// Páginas apoderado
import PanelApoderado from './pages/PanelApoderado'
import PagosApoderado from './pages/PagosApoderado'

// ============================================================
// Guards reutilizables
// ============================================================

function RequireAuth({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

function RequireConductorLibre({ children }) {
  const { usuario, cargando, esConductorPendiente, esConductorRechazado } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (esConductorPendiente || esConductorRechazado) return <Navigate to="/solicitud-pendiente" replace />
  return children
}

function RequireRol({ rol, children }) {
  const { perfil, cargando } = useAuth()
  if (cargando) return null

  if (perfil?.tipo_usuario !== rol) {
    // Redirige a su panel correcto según rol real
    if (perfil?.tipo_usuario === 'admin') return <Navigate to="/dashboard" replace />
    if (perfil?.tipo_usuario === 'conductor') return <Navigate to="/conductor/panel" replace />
    if (perfil?.tipo_usuario === 'apoderado') return <Navigate to="/apoderado/panel" replace />
    return <Navigate to="/login" replace />
  }

  return children
}

// ============================================================
// Root redirect inteligente
// ============================================================

function RootRedirect() {
  const { usuario, perfil, cargando, esConductorPendiente, esConductorRechazado } = useAuth()

  if (cargando) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
    }}>
      <div className="sh-spinner" />
    </div>
  )

  if (!usuario) return <Navigate to="/login" replace />
  if (esConductorPendiente || esConductorRechazado)
    return <Navigate to="/solicitud-pendiente" replace />

  const rol = perfil?.tipo_usuario
  if (rol === 'admin')     return <Navigate to="/dashboard"        replace />
  if (rol === 'conductor') return <Navigate to="/conductor/panel"  replace />
  if (rol === 'apoderado') return <Navigate to="/apoderado/panel"  replace />

  return <Navigate to="/login" replace />
}

// ============================================================
// App
// ============================================================

export default function App() {
  const { cargando } = useAuth()

  if (cargando) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
    }}>
      <div className="sh-spinner" />
    </div>
  )

  return (
    <Routes>

      {/* ── Públicas ─────────────────────────────────────── */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/solicitud-pendiente"
        element={
          <RequireAuth>
            <SolicitudPendiente />
          </RequireAuth>
        }
      />

      {/* ── Admin ─────────────────────────────────────────── */}
      <Route
        element={
          <RequireConductorLibre>
            <RequireRol rol="admin">
              <LayoutAdmin />
            </RequireRol>
          </RequireConductorLibre>
        }
      >
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/conductores" element={<Conductores />} />
        <Route path="/furgones"    element={<Furgones />} />
        <Route path="/apoderados"  element={<Apoderados />} />
        <Route path="/estudiantes" element={<Estudiantes />} />
        <Route path="/pagos-admin" element={<PagosAdmin />} />
      </Route>

      {/* ── Conductor ─────────────────────────────────────── */}
      <Route
        element={
          <RequireConductorLibre>
            <RequireRol rol="conductor">
              <LayoutConductor />
            </RequireRol>
          </RequireConductorLibre>
        }
      >
        <Route path="/conductor/panel"       element={<PanelRuta />} />
        <Route path="/conductor/estudiantes" element={<PanelEstudiantes />} />
        <Route path="/conductor/apoderados"  element={<ApoderadosConductor />} />
        <Route path="/conductor/perfil"      element={<Perfil />} />
      </Route>

      {/* ── Apoderado ─────────────────────────────────────── */}
      <Route
        element={
          <RequireAuth>
            <RequireRol rol="apoderado">
              <LayoutApoderado />
            </RequireRol>
          </RequireAuth>
        }
      >
        <Route path="/apoderado/panel"  element={<PanelApoderado />} />
        <Route path="/apoderado/pagos"  element={<PagosApoderado />} />
        <Route path="/apoderado/perfil" element={<Perfil />} />
      </Route>

      {/* ── Fallback ──────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  )
}
