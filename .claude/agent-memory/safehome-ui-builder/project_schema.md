---
name: SafeHome Supabase schema and AuthContext API
description: Table names, column fields, and AuthContext exports confirmed from codebase
type: project
---

Supabase table is named `perfil` (singular, NOT `perfiles`). Fields confirmed: `id` (uuid, FK to auth.users), `nombre` (text), `tipo_usuario` (text: 'admin' | 'conductor' | 'apoderado'), `correo` (text).

AuthContext (`src/context/AuthContext.jsx`) exposes:
- `usuario` — raw Supabase auth user object (or null)
- `perfil` — row from `perfil` table (or null)
- `cargando` — boolean, true while session/profile are loading
- `cerrarSesion()` — calls supabase.auth.signOut()

**Why:** These names differ from what you might assume (e.g., `perfiles` vs `perfil`, `user` vs `usuario`). Getting them wrong breaks auth entirely.

**How to apply:** Always use `perfil?.tipo_usuario`, `perfil?.nombre`, `usuario`, `cargando`, `cerrarSesion` when working with auth state. Query `.from('perfil')` not `.from('perfiles')`.
