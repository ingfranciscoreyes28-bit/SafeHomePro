---
name: SafeHome CSS design system
description: CSS custom properties, shared utility classes, and role color conventions from global.css
type: project
---

## Key CSS variables (defined in src/styles/global.css)

### Colors
- `--color-bg: #0D0D0D` — page background
- `--color-surface: #1A1A1A` — card/panel surface
- `--color-surface-2: #242424`
- `--color-surface-3: #2E2E2E`
- `--color-primary: #F5C518` — amber/gold (NOT #FFC107 — the actual value is #F5C518)
- `--color-primary-hover: #D4A017`
- `--color-primary-dark: #B8860B`
- `--color-primary-faint: rgba(245,197,24,0.08)`
- `--color-primary-glow: rgba(245,197,24,0.25)`
- `--color-text: #FFFFFF`
- `--color-text-secondary: #A0A0A0`
- `--color-text-muted: #666666`
- `--color-text-on-primary: #0D0D0D`
- `--color-border: #2A2A2A`
- `--color-border-hover: #3A3A3A`
- `--color-border-focus: #F5C518`
- `--color-error: #FF4444`
- `--color-success: #44BB44`

### Role badge colors
- Admin: `--color-role-admin: #A855F7`, `--color-role-admin-bg: rgba(168,85,247,0.15)`
- Conductor: `--color-role-conductor: #F5C518`, `--color-role-conductor-bg: rgba(245,197,24,0.15)`
- Apoderado: `--color-role-apoderado: #4A9EFF`, `--color-role-apoderado-bg: rgba(74,158,255,0.15)`

### Spacing (--space-N where N = 1,2,3,4,5,6,8,10,12,16 in 4px increments)
- `--space-2: 8px`, `--space-4: 16px`, `--space-6: 24px`, `--space-8: 32px`

### Transitions
- `--transition-fast: 0.15s ease`
- `--transition-normal: 0.25s ease`

### Z-index
- `--z-dropdown: 100`, `--z-modal: 200`, `--z-toast: 300`

### Radii
- `--radius-xs: 4px`, `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-full: 9999px`

### Shadows
- `--shadow-sm`, `--shadow-card`, `--shadow-lg`, `--shadow-golden`, `--shadow-golden-lg`

## Shared utility classes (global.css)
- `.sh-btn` — primary button (full width, amber bg)
- `.sh-btn-ghost` — outline/secondary button
- `.sh-btn-danger` — red danger button
- `.sh-input`, `.sh-select` — form controls
- `.sh-badge`, `.sh-badge--admin`, `.sh-badge--conductor`, `.sh-badge--apoderado` — role badges
- `.sh-card` — base card
- `.sh-alert--error`, `.sh-alert--success`
- `.sh-spinner`, `.sh-spinner--dark`
- `.sh-divider`, `.sh-label`, `.sh-field-error`

## Dashboard patterns (src/styles/Dashboard.css)
Header uses: `rgba(13,13,13,0.85)` bg + `backdrop-filter: blur(12px)` + height `64px`
Mobile breakpoint: `max-width: 768px`
Animation: `dash-fadeIn` keyframe (opacity 0->1, translateY 12px->0)
