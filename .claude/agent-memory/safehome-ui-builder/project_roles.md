---
name: SafeHome role system and UI patterns per role
description: Three roles with distinct dashboard panels, badge colors, and data patterns
type: project
---

Three roles: `admin`, `conductor`, `apoderado`. Stored in `perfil.tipo_usuario`.

Badge colors:
- admin: purple (#A855F7), class `sh-badge--admin`
- conductor: gold (#F5C518), class `sh-badge--conductor`
- apoderado: blue (#4A9EFF), class `sh-badge--apoderado`

Dashboard panel breakdown:
- **admin**: stats grid (furgones, conductores, apoderados, estudiantes) + quick actions grid + active routes table
- **conductor**: today's route info card + stats (total/present/pending) + student checklist with attendance toggle
- **apoderado**: assigned conductor info card + child status cards + notifications list

**Why:** Each role has a fundamentally different mental model. Admin is about management, conductor about daily operations, apoderado about passive monitoring.

**How to apply:** When adding features, always consider all 3 role views. Dashboard uses conditional rendering (`tipoUsuario === 'admin'` etc.) with separate sub-components per role.
