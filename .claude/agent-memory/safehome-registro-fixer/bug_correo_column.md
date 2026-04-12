---
name: Root cause of 406 errors on dashboard after registration
description: The perfil insert in Registro.jsx included a non-existent correo column, silently failing and leaving no profile row
type: project
---

The original `Registro.jsx` called `supabase.from('perfil').upsert({ ..., correo: ... })`. The `perfil` table has no `correo` column, so Supabase returned a 400/406 error. Because the result was not captured (`await` with no destructuring), the error was swallowed silently. The user saw "Registro exitoso" but no profile row was ever written.

Downstream effect: `AuthContext.obtenerPerfil` uses `.single()`, which returns PGRST116 (no rows) when the profile is missing. `perfil` is set to `null` in the context. The Dashboard falls back to `tipo_usuario = 'apoderado'` and shows empty data. The 406 in the network tab came from PostgREST responding to `.single()` on an empty result set.

**Fix applied (2026-04-12):**
- Changed `upsert` to `insert` in `Registro.jsx`
- Removed the `correo` field from the payload
- Added `rut: ''` and `telefono: ''` as required by the schema
- Captured `{ error: perfilError }` and surface it via `setErrorGeneral` if it fails

**Why:** So future contributors know the perfil table schema and that correo is NOT a column there.
**How to apply:** Any time the perfil table is written to, verify the payload only contains: id, nombre, rut, telefono, tipo_usuario.
