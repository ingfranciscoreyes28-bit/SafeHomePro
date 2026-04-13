---
name: SafeHome project overview
description: Stack, roles, routing structure, and AuthContext API surface for SafeHome
type: project
---

## Stack
- React + Vite + Supabase
- React Router v6 (NavLink, Outlet, useNavigate)
- No UI component library — all custom CSS

## Roles
- `admin` — full system management
- `conductor` — route, student, attendance management
- `apoderado` — child tracking, furgon status, payments

## AuthContext (`src/context/AuthContext.jsx`)
Exposed via `useAuth()`:
- `usuario` — Supabase auth user object
- `perfil` — row from `perfil` table: `{ id, nombre, foto, tipo_usuario, estado, ... }`
- `cargando` — boolean
- `cerrarSesion()` — calls supabase.auth.signOut()
- `esConductorPendiente` — derived boolean (tipo_usuario==='conductor' && estado==='pendiente')
- `esConductorRechazado` — derived boolean (tipo_usuario==='conductor' && estado==='rechazado')

To get name: `perfil?.nombre`
To get role: `perfil?.tipo_usuario`
To get photo: `perfil?.foto`

## Route structure (App.jsx as of April 2026)
- `/` → redirect to /login
- `/login` — Login page
- `/registro` — Registro page
- `/dashboard` — protected, role-based (currently renders `<Dashboard />` directly, not via layout)
- `/solicitud-pendiente` — conductor pending approval
- `*` → redirect to /login

**Note:** As of session start, App.jsx renders `<Dashboard />` directly without using layout wrappers. Layouts were created for future integration — the developer will wire them into the route tree.

**Why:** Layouts were requested as isolated, production-ready files. No modification to App.jsx was requested.

**How to apply:** When wiring layouts into routing, wrap role-specific routes in layout components using React Router v6 nested routes pattern (`<Route element={<LayoutAdmin />}><Route path="..." /></Route>`).
