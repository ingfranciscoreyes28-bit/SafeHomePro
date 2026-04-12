---
name: SafeHome Project Architecture
description: Stack, file locations, auth context shape, Supabase client export pattern
type: project
---

**Stack:** React + Vite + Supabase + React Router DOM. Dark mode with golden yellow accents.

**Key file paths:**
- Supabase client: `src/services/supabase.js` — exports named `supabase` via `export const supabase = createClient(...)`
- Auth context: `src/context/AuthContext.jsx` — exports `AuthProvider` and `useAuth` hook
- Dashboard: `src/pages/Dashboard.jsx`
- Global styles: `src/styles/global.css` and `src/styles/Dashboard.css`

**AuthContext shape:**
- `useAuth()` returns `{ usuario, perfil, cargando, cerrarSesion }`
- `usuario` = Supabase auth user object (has `.id` = UUID matching `perfil.id`)
- `perfil` = row from `perfil` table fetched by `usuario.id`
- `cargando` = boolean, true while session and profile are loading
- `cerrarSesion()` = calls `supabase.auth.signOut()`

**Role determination:** `perfil.tipo_usuario` — values: `'admin'`, `'conductor'`, `'apoderado'`

**Why:** These are the core wiring points for any component that needs auth or Supabase data.
**How to apply:** Always import supabase from `src/services/supabase.js`. Access role via `perfil.tipo_usuario`. Pass `usuario` (not just `perfil`) to sub-components that need `usuario.id` for queries.
