---
name: SafeHome Design System Conventions
description: Dark/golden CSS class naming, spinner/error component patterns for Dashboard
type: project
---

**Theme:** Dark mode with golden yellow primary accent. CSS custom properties used throughout.

**Key CSS variables:**
- `--color-primary` — golden yellow accent
- `--color-surface` — dark card background
- `--color-border` — subtle dark border
- `--color-text-muted` — muted text color
- `--color-text-secondary` — secondary text
- `--space-4`, `--space-6` — spacing scale
- `--radius-lg` — large border radius

**Loading state:** Reuse existing `.dashboard-loading` / `.dashboard-loading__spinner` / `.dashboard-loading__text` classes from Dashboard.css. For section-level loading, wrap in `<div className="dashboard-loading" style={{ minHeight: '200px' }}>`.

**Error state:** Use inline style with `rgba(239,68,68,0.1)` background, `rgba(239,68,68,0.3)` border, `#fca5a5` text. No dedicated CSS class — apply via style prop to keep design consistent.

**Badge classes:** `sh-badge sh-badge--admin`, `sh-badge sh-badge--conductor`, `sh-badge sh-badge--apoderado`

**Status indicator:** `dashboard-info-card__status--active` / `dashboard-info-card__status--inactive`. Pulse dot: `dashboard-info-card__status-dot--pulse`.

**Stat cards:** `.dashboard-stat-card` with `__icon`, `__value`, `__label`, `__trend` children.

**Info cards:** `.dashboard-info-card` with `__header`, `__header-icon`, `__header-title`, `__body`. Data rows: `.dashboard-data-rows` > `.dashboard-data-row` > `__label` (with `__label-icon`) + `__value`.

**Why:** Design must be preserved 100% — no new CSS classes or style changes.
**How to apply:** Never add or remove CSS classes. Use existing classes for all new UI states.
