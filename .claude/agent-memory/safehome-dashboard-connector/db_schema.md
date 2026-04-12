---
name: SafeHome Database Schema
description: Table names, confirmed columns, and relationships used in Dashboard queries
type: project
---

**Table: `perfil`** (singular — NOT `perfiles`)
- `id` (UUID, matches Supabase auth user id)
- `nombre` (text)
- `tipo_usuario` (text: 'admin' | 'conductor' | 'apoderado')
- `correo` (text)
- `telefono` (text, optional — used in apoderado view for conductor contact)

**Table: `furgon`**
- `id`
- `nombre` (text, route/van name)
- `patente` (text)
- `tipo` (text, e.g. 'Minibús')
- `id_conductor` (UUID FK → perfil.id)
- `colegio` (text, optional)
- `hora_salida` (text, optional)

**Table: `estudiante`**
- `id`
- `nombre` (text)
- `curso` (text, optional)
- `direccion` (text, optional)
- `id_furgon` (FK → furgon.id)
- `id_apoderado` (UUID FK → perfil.id)

**Key relationships:**
- Conductor → Furgón: `furgon.id_conductor = usuario.id`
- Furgón → Estudiantes: `estudiante.id_furgon = furgon.id`
- Apoderado → Estudiantes: `estudiante.id_apoderado = usuario.id`
- Apoderado → Furgón: via `estudiante.id_furgon`, then query `furgon` by that id
- Furgón → Conductor profile: `perfil.id = furgon.id_conductor`

**Why:** Dashboard queries depend on these exact column names and FK chains.
**How to apply:** Use these column names verbatim in `.eq()` calls. When furgon is not found, Supabase returns `PGRST116` — treat this as "no record" not a fatal error.
