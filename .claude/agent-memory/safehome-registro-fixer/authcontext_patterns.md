---
name: AuthContext session handling patterns
description: How AuthContext loads the session and profile, and the race condition that was fixed
type: reference
---

**Original bug (fixed 2026-04-12):**
The original code called both `supabase.auth.getSession()` AND `supabase.auth.onAuthStateChange()`. Since `onAuthStateChange` fires immediately with the current session on mount, this caused `obtenerPerfil` to be called twice concurrently, producing a race where `setCargando(false)` fired twice and state updates could interleave.

**Fix:** Removed the `getSession` call entirely. `onAuthStateChange` alone is sufficient — it fires synchronously on mount with the current session, then again on any future auth state change.

**Profile loading:**
`obtenerPerfil(id)` queries `perfil` table with `.single()`. If the user exists in auth but has no profile row (e.g., insert failed during registration), `.single()` returns PGRST116. This is handled gracefully: `perfil` is set to `null`, `cargando` is set to `false`, and the Dashboard falls back to `tipo_usuario = 'apoderado'`.

**Context values exposed:** `{ usuario, perfil, cargando, cerrarSesion }`
- `usuario` — raw Supabase auth user object (has `.id`, `.email`)
- `perfil` — row from `perfil` table, or `null`
- `cargando` — true while loading session + profile
- `cerrarSesion` — calls `supabase.auth.signOut()`
