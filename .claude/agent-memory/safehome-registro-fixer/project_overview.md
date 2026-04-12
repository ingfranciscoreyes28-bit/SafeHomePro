---
name: SafeHome project overview
description: Stack, key file paths, perfil table schema, and end-to-end auth flow
type: project
---

React + Vite + Supabase + React Router DOM school transport management app.

**Key files:**
- `src/services/supabase.js` — exports `{ supabase }` (named export, not default)
- `src/context/AuthContext.jsx` — exports `AuthProvider` and `useAuth()`. Exposes `{ usuario, perfil, cargando, cerrarSesion }`
- `src/pages/Registro.jsx` — registration page
- `src/pages/Login.jsx` — login page; calls `supabase.auth.signInWithPassword` then navigates to `/dashboard`
- `src/pages/Dashboard.jsx` — shows different panels based on `perfil.tipo_usuario` (admin/conductor/apoderado)
- `src/App.jsx` — routes: `/` → `/login`, `/login`, `/registro`, `/dashboard`, `*` → `/login`

**`perfil` table columns:** `id` (uuid = auth user id), `nombre` (text), `rut` (text), `telefono` (text), `tipo_usuario` (text: 'apoderado' | 'conductor')
- No `correo` column — inserting it causes a 406/400 error

**End-to-end auth flow:**
1. Registro: `signUp` → `insert into perfil(id, nombre, tipo_usuario, rut='', telefono='')` → navigate to `/login`
2. Login: `signInWithPassword` → AuthContext fires `onAuthStateChange` → `obtenerPerfil(user.id)` → Dashboard renders

**Why:** Reference for all future work on this repo so we don't re-read the same files from scratch.
**How to apply:** Use as a starting map before diving into any file.
