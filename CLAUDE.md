# CLAUDE.md — SafeHome

> Archivo de contexto para Claude Code CLI. Lee esto completo antes de tocar cualquier archivo.

---

## Identidad del proyecto

**SafeHome** es una aplicación web de gestión de transporte escolar (furgones escolares) en Chile. Permite a un administrador (dueño de flota) gestionar conductores, furgones, apoderados, estudiantes, rutas, itinerarios y pagos. Tiene tres roles de usuario: `admin`, `conductor` y `apoderado`.

**Autor:** Francisco — desarrollador en formación, este es su proyecto de portafolio.
**Estado:** En desarrollo activo, desplegado en Vercel (free tier). No tiene clientes reales aún.

---

## Stack tecnológico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Frontend | React 18+ con Vite | SPA, no SSR |
| Routing | React Router DOM v6 | Rutas anidadas con layouts por rol |
| Estilos | CSS puro con custom properties | SIN Tailwind, SIN MUI, SIN libs de UI |
| Auth | Supabase Auth | Email/password, roles via tabla `perfil` |
| Base de datos | Supabase (PostgreSQL) | Free tier |
| Storage | Supabase Storage | Buckets públicos: `fotos-conductores`, `fotos-furgones` |
| API IA | Flask + Groq API (Python) | Desplegada en Render |
| Deploy frontend | Vercel | Free tier, con `vercel.json` para rewrites |
| Control de versión | Git + GitHub | Branch `main` |

---

## Variables de entorno

```
VITE_SUPABASE_URL=<url del proyecto Supabase>
VITE_SUPABASE_ANON_KEY=<anon key de Supabase>
```

La URL de la API de IA está hardcodeada en `ChatSafeHome.jsx`:
`https://ai-assistant-api-zd1a.onrender.com/chat`

---

## Desarrollo local

```bash
npm install          # Instalar dependencias
npm run dev          # Levantar dev server (Vite, puerto 5173 por defecto)
npm run build        # Build de producción → carpeta dist/
npm run preview      # Preview del build local
```

Requisitos: Node.js 18+, npm. No hay Docker ni backend local (Supabase y la API de IA son servicios remotos).

---

## Estructura de carpetas

```
safehome/
├── .claude/
│   ├── agent-memory/          # Memoria persistente de agentes Claude Code
│   │   ├── safehome-dashboard-connector/
│   │   ├── safehome-foto-upload/
│   │   └── safehome-ui-builder/
│   └── agents/                # Agentes especializados (ver sección Agentes)
│       ├── safehome-dashboard-connector.md
│       ├── safehome-foto-upload.md
│       └── safehome-ui-builder.md
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── components/            # Componentes reutilizables
│   │   ├── ChatSafeHome.jsx   # Chat con IA (NO TOCAR sin permiso)
│   │   ├── ChatWidget.jsx     # Widget flotante del chat (NO TOCAR sin permiso)
│   │   ├── FormConductor.jsx
│   │   ├── FormEstudiante.jsx
│   │   ├── FormFurgon.jsx
│   │   ├── InputFoto.jsx      # Componente de upload de fotos
│   │   ├── ModalConfirmar.jsx
│   │   ├── TablaApoderados.jsx
│   │   ├── TablaConductores.jsx
│   │   ├── TablaEstudiantes.jsx
│   │   ├── TablaFurgones.jsx
│   │   └── TablaPagos.jsx
│   ├── context/
│   │   └── AuthContext.jsx    # Proveedor de autenticación y perfil
│   ├── hooks/                 # Custom hooks (vacío o con hooks futuros)
│   ├── layouts/               # Shell layouts por rol
│   │   ├── LayoutAdmin.jsx
│   │   ├── LayoutApoderado.jsx
│   │   └── LayoutConductor.jsx
│   ├── pages/                 # Páginas de la app
│   │   ├── Apoderados.jsx
│   │   ├── Conductores.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Estudiantes.jsx
│   │   ├── Furgones.jsx
│   │   ├── Login.jsx
│   │   ├── PagosAdmin.jsx
│   │   ├── PagosApoderado.jsx
│   │   ├── PanelApoderado.jsx
│   │   ├── PanelEstudiantes.jsx
│   │   ├── PanelRuta.jsx
│   │   ├── Perfil.jsx
│   │   ├── Registro.jsx
│   │   └── SolicitudPendiente.jsx
│   ├── services/
│   │   ├── supabase.js        # Inicialización del cliente (named export)
│   │   └── storage.js         # Funciones subirFoto / eliminarFoto
│   ├── styles/                # Un CSS por página/componente + global
│   │   ├── global.css         # Variables CSS y estilos base
│   │   ├── Apoderados.css
│   │   ├── Conductores.css
│   │   ├── Dashboard.css
│   │   ├── Estudiantes.css
│   │   ├── Furgones.css
│   │   ├── InputFoto.css
│   │   ├── LayoutAdmin.css
│   │   ├── LayoutApoderado.css
│   │   ├── LayoutConductor.css
│   │   ├── Login.css
│   │   ├── Pagos.css
│   │   ├── PagosApoderado.css
│   │   ├── PanelApoderado.css
│   │   ├── PanelEstudiantes.css
│   │   ├── PanelRuta.css
│   │   ├── Perfil.css
│   │   └── Registro.css
│   ├── App.jsx                # Router principal con guards
│   ├── index.css
│   └── main.jsx               # Entry point (ReactDOM.createRoot)
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

---

## Base de datos — Schema Supabase

### Tabla `perfil` (tabla central de usuarios)
- `id` uuid PK → FK a `auth.users(id)` (el id viene de Supabase Auth)
- `nombre` text NOT NULL
- `rut` text NOT NULL
- `telefono` text
- `tipo_usuario` text NOT NULL — CHECK: `'admin'`, `'conductor'`, `'apoderado'`
- `foto` text (URL pública de Storage, nullable)
- `estado` text NOT NULL DEFAULT `'aprobado'` — valores: `'pendiente'`, `'aprobado'`, `'rechazado'`
- `created_at`, `updated_at` timestamps

### Tabla `conductor_detalle`
- `id` uuid PK
- `id_perfil` uuid FK → `perfil(id)`
- `tipo_licencia`, `cod_licencia` text
- `fecha_vencimiento_licencia` date
- `años_experiencia` integer

### Tabla `furgon`
- `id` uuid PK
- `matricula` text UNIQUE NOT NULL
- `marca`, `modelo` text
- `anio` integer, `capacidad` integer
- `foto_furgon` text (URL pública, nullable)
- `id_conductor` uuid FK → `perfil(id)` — vinculación conductor↔furgón

### Tabla `estudiante`
- `id` uuid PK
- `rut_estudiante` text UNIQUE NOT NULL
- `nombre_estudiante` text NOT NULL
- `fecha_nacimiento` date, `curso` text, `colegio` text
- `id_apoderado` uuid FK → `perfil(id)`
- `id_furgon` uuid FK → `furgon(id)`

### Tabla `ruta`
- `id` uuid PK
- `punto_inicio`, `punto_final` text NOT NULL
- `descripcion_ruta` text, `duracion` text
- `horario_salida` time
- `lat_inicio`, `lng_inicio`, `lat_final`, `lng_final` numeric
- `id_furgon` uuid FK → `furgon(id)`

### Tabla `itinerario`
- `id` uuid PK
- `fecha_itinerario` date NOT NULL
- `estado` text CHECK: `'pendiente'`, `'en_curso'`, `'completado'`
- `id_ruta` FK → `ruta(id)`, `id_furgon` FK → `furgon(id)`, `id_conductor` FK → `perfil(id)`

### Tabla `pago`
- `id` uuid PK
- `monto` numeric NOT NULL
- `fecha_pago` date, `mes_correspondiente` date
- `estado_pago` text CHECK: `'pendiente'`, `'pagado'`, `'atrasado'`
- `metodo_pago` text, `descripcion` text
- `id_estudiante` FK → `estudiante(id)`, `id_apoderado` FK → `perfil(id)`

### Relaciones clave
```
auth.users(id) ──1:1──► perfil(id)
perfil(id) ──1:1──► conductor_detalle(id_perfil)
perfil(id) ──1:1*─► furgon(id_conductor)        [*DB permite 1:N pero negocio es 1:1]
perfil(id) ──1:N──► estudiante(id_apoderado)     [un apoderado tiene estudiantes]
furgon(id) ──1:N──► estudiante(id_furgon)        [un furgón tiene estudiantes]
furgon(id) ──1:N──► ruta(id_furgon)              [un furgón tiene rutas]
ruta(id)   ──1:N──► itinerario(id_ruta)
perfil(id) ──1:N──► pago(id_apoderado)
estudiante(id) ──1:N──► pago(id_estudiante)
```

> **Nota:** La relación conductor↔furgón no tiene constraint UNIQUE en `furgon.id_conductor`, pero en la lógica de negocio cada conductor se asigna a un solo furgón. No agregar validación de unicidad sin confirmación de Francisco.

---

## Autenticación y autorización

### Flujo de auth
1. Usuario se registra en `/registro` → `supabase.auth.signUp()` crea fila en `auth.users`
2. Se inserta fila en `perfil` con `tipo_usuario` e `id` del auth user
3. Si es conductor: `estado` empieza como `'pendiente'` → admin lo aprueba/rechaza
4. Si es apoderado: `estado` queda como `'aprobado'` (default) → accede directo, sin aprobación
5. Login: `supabase.auth.signInWithPassword()` → se carga perfil desde tabla `perfil`

> **Importante:** solo los conductores pasan por flujo de aprobación. Los apoderados se auto-aprueban. No implementar flujo de aprobación para apoderados.

### AuthContext.jsx expone:
- `usuario` — objeto de Supabase Auth (session user)
- `perfil` — fila de la tabla `perfil` con `tipo_usuario`, `estado`, etc.
- `cargando` — boolean de loading inicial
- `cerrarSesion()` — cierra sesión de Supabase
- `esConductorPendiente` — boolean
- `esConductorRechazado` — boolean

### Guards de ruta (en App.jsx)
- `RequireAuth` — redirige a `/login` si no hay sesión
- `RequireConductorLibre` — redirige a `/solicitud-pendiente` si conductor pendiente/rechazado
- `RequireRol({ rol })` — redirige al panel correcto si el rol no coincide
- `RootRedirect` — redirige `/` al panel correcto según rol

### RLS (Row Level Security)
**⚠️ ESTADO ACTUAL: DESACTIVADO en todas las tablas.**
Esto es deuda técnica crítica. Antes de ir a producción con clientes reales, se deben implementar políticas RLS para cada tabla. Mientras tanto, la seguridad depende enteramente del frontend (insuficiente).

---

## Routing

```
/                           → RootRedirect (según rol)
/login                      → Login
/registro                   → Registro
/solicitud-pendiente        → SolicitudPendiente (RequireAuth)

── Admin (RequireRol "admin" + LayoutAdmin) ──
/dashboard                  → Dashboard
/conductores                → Conductores
/furgones                   → Furgones
/apoderados                 → Apoderados
/estudiantes                → Estudiantes
/pagos-admin                → PagosAdmin

── Conductor (RequireRol "conductor" + LayoutConductor) ──
/conductor/panel            → PanelRuta
/conductor/estudiantes      → PanelEstudiantes
/conductor/perfil           → Perfil

── Apoderado (RequireRol "apoderado" + LayoutApoderado) ──
/apoderado/panel            → PanelApoderado
/apoderado/pagos            → PagosApoderado
/apoderado/perfil           → Perfil

/*                          → Redirect a /login
```

> **Componente compartido:** `Perfil.jsx` se usa tanto en `/conductor/perfil` como en `/apoderado/perfil`. Cualquier cambio en ese componente afecta ambos roles. Internamente usa `perfil.tipo_usuario` del AuthContext para adaptar lo que muestra.

---

## Design system

### Tema
- **Modo oscuro** como tema primario y único
- **Color primario:** `#F5C518` (dorado cálido) — NUNCA usar `#FFC107`
- **Backgrounds:** `#0D0D0D`, `#121212`, `#1A1A1A`
- **Surfaces:** `#1E1E1E`, `#242424`
- **Texto:** blanco primario, gris claro secundario
- **Emojis:** se usan como iconos de navegación (🏠🚌👨‍✈️👨‍👩‍👧🧒💰🚪👤)

### Variables CSS globales (definidas en `global.css`)
```
--color-primary, --color-bg, --color-surface, --color-surface-2, --color-surface-3
--color-border, --color-border-hover
--color-text, --color-text-secondary, --color-text-muted
--color-error, --color-success, --color-info
--space-1 a --space-16
--radius-xs, --radius-sm, --radius-md, --radius-lg, --radius-full
--shadow-lg, --transition-fast
```

### Clases reutilizables
```
sh-input, sh-input--error, sh-select, sh-label, sh-field-error
sh-btn, sh-btn-ghost, sh-btn-danger
sh-spinner, sh-alert, sh-alert--error
sh-badge, sh-badge--admin, sh-badge--conductor, sh-badge--apoderado
modal-overlay, modal-box, modal-box--form
```

### Reglas de estilo
- NUNCA hardcodear colores. Usar siempre variables CSS
- Cada página tiene su propio archivo CSS en `src/styles/`
- Naming BEM-like por layout: `layout-admin__sidebar`, `layout-conductor__nav-item`
- Mobile-first con sidebar que se despliega via hamburger + overlay
- Border-radius redondeado (8px–16px)

---

## Servicios externos

### Supabase (supabase.js)
```javascript
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key)
```
**Export named**, no default. Importar siempre como: `import { supabase } from '../services/supabase'`

### Storage (storage.js)
Dos funciones:
- `subirFoto(bucket, archivo, idRegistro)` → valida MIME + tamaño (2MB max) → sube → retorna `{ url, path }`
- `eliminarFoto(bucket, path)` → elimina del bucket

Buckets activos: `fotos-conductores`, `fotos-furgones`
Políticas de Storage: ambos buckets son públicos con SELECT/INSERT/UPDATE/DELETE habilitado para usuarios `authenticated`. No hay restricción por usuario (cualquier autenticado puede subir/borrar en cualquier bucket).

### API de IA (Flask en Render)
- Endpoint: `POST https://ai-assistant-api-zd1a.onrender.com/chat`
- Es un servicio genérico de chatbot: Flask recibe un mensaje, lo envía a Groq con un system prompt, y retorna la respuesta
- El contexto del bot se define via system prompt (actualmente puede no ser específico de SafeHome)
- Se consume desde `ChatSafeHome.jsx` y `ChatWidget.jsx`
- Plan futuro: conectar este mismo servicio a WhatsApp via n8n
- **Estos archivos los hizo Francisco solo. No modificar sin permiso explícito.**

---

## Patrones de código

### Componentes
- Funcionales con hooks (`useState`, `useEffect`, `useNavigate`)
- Auth se obtiene con `const { perfil, cerrarSesion } = useAuth()`
- Queries a Supabase directas con el cliente (no hay capa de abstracción/servicios por tabla)
- Errores manejados con try/catch, mensajes en español para el usuario

### Layouts
Los tres layouts (Admin, Conductor, Apoderado) siguen el mismo patrón:
- Sidebar fijo con iconos + tooltips
- Header sticky con nombre, avatar/iniciales, badge de rol, botón logout
- Área de contenido con `<Outlet />` de React Router
- Responsive: sidebar se oculta en mobile, se abre con hamburger + backdrop
- **Código duplicado:** la función `getInitials(nombre)`, la lógica de `sidebarOpen`, `handleCerrarSesion`, y la estructura JSX completa están copiados en los tres archivos. Solo cambian los prefijos CSS (`layout-admin__`, `layout-conductor__`, `layout-apoderado__`) y los items de navegación (`NAV_ITEMS`). Candidato a refactor con un `BaseLayout` parametrizado, pero NO refactorizar sin que Francisco lo pida.

### Formularios
- Estado local con `useState` por campo
- Validación en el submit handler
- Loading state en el botón ("Guardando...", "Subiendo foto...")
- Errores mostrados en `sh-alert--error`

### Tablas
- Componentes `Tabla*.jsx` reciben datos como props
- Muestran avatares circulares (foto o inicial)
- Acciones inline: editar, eliminar (con ModalConfirmar)

---

## Flujos de negocio principales

### Registro de conductor (con aprobación)
1. Conductor se registra en `/registro` (tipo_usuario = 'conductor')
2. Se crea en `auth.users` + `perfil` con `estado = 'pendiente'`
3. Conductor ve `/solicitud-pendiente` hasta ser aprobado
4. Admin va a `/conductores` → ve solicitud → acepta → agrega datos de licencia en `conductor_detalle` → `estado = 'aprobado'`
5. Conductor puede acceder a su panel

### Asignación de estudiante
1. Admin va a `/estudiantes` → agrega estudiante con nombre, RUT, colegio, curso
2. Selecciona apoderado (de los perfiles tipo apoderado)
3. Selecciona furgón (que ya debe tener conductor vinculado)
4. Se crea fila en `estudiante` con `id_apoderado` e `id_furgon`

### Vinculación conductor ↔ furgón
1. Admin va a `/furgones` → edita furgón → selecciona conductor
2. Se actualiza `furgon.id_conductor`

### Pagos (vista actual — sin integración de pasarela)
1. Admin crea registros de pago en `/pagos-admin` con monto, estudiante, apoderado, mes
2. Apoderado ve sus pagos en `/apoderado/pagos`
3. Estados: `pendiente` → `pagado` / `atrasado`
4. **Pasarela de pagos: POR DEFINIR** (se busca la opción más simple y económica para Chile)

---

## Flujo de datos

```
Auth:
  Login → supabase.auth.signInWithPassword() → auth.users → consulta perfil → AuthContext → guards → layout por rol → página

CRUD (ejemplo: crear estudiante):
  FormEstudiante → useState local → submit → supabase.from('estudiante').insert() → respuesta → actualizar tabla padre

Upload de fotos:
  InputFoto (selecciona archivo) → padre llama subirFoto() → storage.js valida + sube a bucket → URL pública → se guarda en columna foto/foto_furgon de la tabla

Registro de conductor:
  Registro.jsx → signUp() → insert en perfil con estado='pendiente' → conductor ve /solicitud-pendiente → admin aprueba → insert en conductor_detalle → estado='aprobado' → conductor accede a su panel
```

---

## Prioridades operativas

> Cuando Francisco pida "mejora el proyecto" o haya que decidir qué hacer primero, seguir este orden.

| Prioridad | Área | Detalle | Estado |
|-----------|------|---------|--------|
| 🔴 CRÍTICA | Activar RLS | Políticas por rol: admin accede a todo, conductor/apoderado solo a sus datos. Auditar queries sin filtro | Pendiente |
| 🔴 CRÍTICA | Validar anon key | Sin RLS, la anon key expone toda la DB desde el navegador | Pendiente |
| 🟡 ALTA | Pasarela de pagos | Integrar pagos reales. Proveedor por definir (se busca simple y económico para Chile) | Pendiente |
| 🟡 ALTA | Centralizar queries | Mover queries de Supabase de componentes a archivos en `services/` | Pendiente |
| 🟡 ALTA | Mapa visual de rutas | API de mapas por definir. Las rutas ya tienen lat/lng en la DB | Pendiente |
| 🟢 MEDIA | Refactorizar layouts | Los 3 layouts comparten ~95% del código. Candidato a BaseLayout | Pendiente |
| 🟢 MEDIA | Vista apoderados para conductor | El conductor debería ver los apoderados de sus estudiantes | Pendiente |
| 🟢 MEDIA | Chat IA vía WhatsApp | Conectar Flask API a WhatsApp via n8n | Pendiente |
| 🟢 MEDIA | Pago admin → conductor | Sistema de pago del admin hacia conductores. Por diseñar | Pendiente |
| 🔵 BAJA | Agregar testing | No hay tests unitarios ni E2E | Pendiente |
| 🔵 BAJA | Migrar a TypeScript | Todo es JS puro actualmente | Pendiente |

---

## Criterio de decisiones

> Cómo debe pensar Claude Code al proponer soluciones en este proyecto.

- **Simplicidad sobre abstracción** — si se resuelve en 5 líneas, no crear un hook/servicio/util nuevo
- **No optimizar prematuramente** — el proyecto está en desarrollo, no en escala
- **Consistencia sobre innovación** — seguir los patrones que ya existen (CSS puro, español, useState)
- **Preguntar antes de agregar dependencias** — no instalar librerías sin confirmación de Francisco
- **Cambios pequeños y seguros** — un archivo a la vez, verificar que no rompe otros flujos
- **Seguridad siempre** — cualquier feature nueva debe considerar que RLS aún no está activo

---

## Reglas para Claude Code

### Antes de modificar cualquier archivo
1. **Lee el archivo completo primero** — no asumas la estructura
2. **Verifica imports reales** — `supabase` es named export, no default
3. **Respeta el design system** — usa variables CSS, no colores hardcodeados
4. **No refactorices sin que te lo pidan** — este proyecto tiene su estilo propio

### Archivos protegidos (NO TOCAR sin permiso explícito)
- `src/components/ChatSafeHome.jsx`
- `src/components/ChatWidget.jsx`
- `src/context/AuthContext.jsx` (leer sí, modificar solo si es necesario y con cuidado)
- `src/styles/global.css` (agregar es OK, modificar variables existentes NO)

### Al crear archivos nuevos
- Componente → `src/components/NombreComponente.jsx`
- Página → `src/pages/NombrePagina.jsx`
- Estilo → `src/styles/NombrePagina.css` (un CSS por componente/página)
- Servicio → `src/services/nombreServicio.js`

### Convenciones de naming
- Archivos: PascalCase para componentes/páginas, camelCase para servicios
- CSS classes: BEM-like con prefijo del componente (`layout-admin__`, `form-conductor__`)
- Variables de estado: español (`cargando`, `error`, `datos`)
- Funciones: español (`cerrarSesion`, `subirFoto`, `handleGuardar`)

### Errores y UX
- Mensajes de error siempre en español
- Loading states en todos los botones de submit
- Usar `sh-spinner` para estados de carga globales
- Usar `sh-alert--error` para errores en formularios

### Anti-patrones — NO hacer esto NUNCA
```javascript
// ❌ Import default de supabase (es named export)
import supabase from '../services/supabase'
// ✅ Correcto
import { supabase } from '../services/supabase'

// ❌ Hardcodear colores
style={{ color: '#F5C518', background: '#1A1A1A' }}
// ✅ Usar variables CSS
style={{ color: 'var(--color-primary)', background: 'var(--color-surface)' }}

// ❌ Agregar Tailwind, MUI, Chakra o cualquier lib de UI
npm install @mui/material tailwindcss
// ✅ Usar las clases sh-* existentes y CSS puro

// ❌ Crear un archivo .tsx (el proyecto no usa TypeScript)
src/components/NuevoComponente.tsx
// ✅ Siempre .jsx / .js
src/components/NuevoComponente.jsx

// ❌ Modificar ChatSafeHome.jsx o ChatWidget.jsx sin preguntar
// ❌ Refactorizar código existente sin que lo pidan
// ❌ Cambiar variables existentes en global.css
// ❌ Crear queries a tablas que no existen en el schema documentado arriba
```

### Auto-mantenimiento del CLAUDE.md

> Esta regla es obligatoria. Claude Code debe mantener este archivo actualizado.

Después de completar una tarea que resuelva algo documentado en este archivo (un item de deuda técnica, una funcionalidad pendiente, una prioridad operativa), Claude Code **debe**:

1. **Preguntar a Francisco:** *"Esto resuelve [X item] del CLAUDE.md. ¿Quieres que lo actualice? Puedo marcarlo como completado, actualizarlo con la implementación real, o eliminarlo si ya no aplica."*
2. **No editar el CLAUDE.md sin confirmación** — siempre preguntar primero
3. **Ser específico:** indicar exactamente qué línea/sección cambiaría y por qué

Ejemplos de cuándo debe activarse:
- Se activó RLS → preguntar si sacar ese item de deuda técnica y actualizar la sección de auth
- Se integró Transbank para pagos → preguntar si mover de "pendiente" a "implementado" y documentar el proveedor
- Se refactorizaron los layouts → preguntar si actualizar la sección de patrones de código
- Se agregó una tabla nueva → preguntar si agregarla al schema documentado

**El objetivo:** que este archivo refleje siempre el estado real del proyecto, no una foto del pasado.

---

## Agentes Claude Code disponibles

Existen tres agentes en `.claude/agents/`. Evaluar si siguen siendo útiles:

| Agente | Propósito | Estado |
|--------|-----------|--------|
| `safehome-dashboard-connector` | Conectar Dashboard.jsx con datos reales de Supabase | Posiblemente completado |
| `safehome-foto-upload` | Implementar upload de fotos para conductores y furgones | Posiblemente completado |
| `safehome-ui-builder` | Crear/mejorar páginas y componentes UI | Uso general |

Si un agente ya cumplió su propósito y no aporta valor futuro, Francisco puede eliminarlo.

---

## Contexto de deploy

### Vercel (frontend)
- Branch: `main`
- Build command: `vite build`
- Output: `dist/`
- Variables de entorno configuradas en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `vercel.json` maneja rewrites para SPA routing

### Render (API IA)
- App Flask con endpoint `/chat`
- Usa Groq API como LLM
- Free tier — puede tener cold starts lentos
- URL: `https://ai-assistant-api-zd1a.onrender.com`

### Supabase
- Proyecto en free tier
- Auth + PostgreSQL + Storage
- Región: verificar en dashboard de Supabase
