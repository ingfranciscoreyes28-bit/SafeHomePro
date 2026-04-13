---
name: SafeHome layout architecture decisions
description: Per-role CSS file structure, BEM-like naming, sidebar/header/mobile patterns used in the three layout components
type: project
---

## File structure
Each role has two files:
- `src/layouts/Layout{Role}.jsx` — React component
- `src/styles/Layout{Role}.css` — scoped styles (imported by the JSX)

No shared BaseLayout component was created. The three layouts are self-contained.

**Why:** The user explicitly listed 6 separate files to create, with per-role CSS. Keeping them self-contained avoids coupling and makes each layout independently editable.

## CSS naming convention
BEM-like with layout-scope prefix: `.layout-{role}__{element}--{modifier}`

Examples:
- `.layout-admin__sidebar` `.layout-admin__sidebar--open`
- `.layout-admin__nav-item` `.layout-admin__nav-item--active` `.layout-admin__nav-item--logout`
- `.layout-admin__tooltip`
- `.layout-admin__header`, `.layout-admin__header-left`, `.layout-admin__header-right`
- `.layout-admin__avatar`, `.layout-admin__user-name`, `.layout-admin__role-badge`
- `.layout-admin__logout-btn`
- `.layout-admin__main`, `.layout-admin__content`
- `.layout-admin__overlay`, `.layout-admin__overlay--visible`
- `.layout-admin__hamburger`

Same pattern for `layout-conductor__*` and `layout-apoderado__*`.

## Sidebar dimensions
- Width: 64px fixed, icon-only
- Position: `fixed`, full height, `z-index: var(--z-dropdown)` (100)
- Brand mark at top (40x40 box linking to /dashboard)
- Nav items: 44px height, centered icon
- Logout pinned at bottom with a divider above it

## Tooltip
CSS-only: absolutely positioned to the right of each nav-item-wrap, opacity 0 by default,
opacity 1 on `.nav-item-wrap:hover`. Arrow via `::before`/`::after` pseudo-elements.
`z-index: calc(var(--z-dropdown) + 1)` to clear the sidebar.

## Header
- `position: fixed`, height 64px, `left: 64px` (desktop), `left: 0` (mobile)
- Frosted glass: `rgba(13,13,13,0.85)` + `backdrop-filter: blur(12px)`
- `z-index: calc(var(--z-dropdown) - 1)` = 99 so sidebar overlaps on mobile
- Left side: hamburger (mobile) + "SafeHome" title (`<span>Home</span>` in primary color)
- Right side: role badge + avatar + user name + logout button

## Avatar
- If `perfil.foto` exists: `<img>` inside the avatar div
- Else: initials extracted by `getInitials(nombre)` helper (up to 2 chars, uppercase)
- Color: `var(--color-primary)` text on `var(--color-surface-2)` bg

## Active state
Implemented via NavLink's `className` render prop:
```jsx
className={({ isActive }) =>
  `layout-admin__nav-item${isActive ? ' layout-admin__nav-item--active' : ''}`
}
```
Dashboard link uses `end` prop to avoid matching all sub-routes.
Active item: amber faint background + primary color text + 3px amber left bar (::before).

## Mobile behavior
- Sidebar: `transform: translateX(-100%)` by default, `translateX(0)` when `--open` modifier present
- Backdrop overlay: `display: none` -> `display: block` via `--visible` modifier
- Hamburger: `display: none` on desktop, `display: flex` at `max-width: 768px`
- Main area: `margin-left: 0` on mobile, `width: 100%`
- Role badge and user name hidden on mobile (`.layout-admin__role-badge { display: none }`)

## Outlet usage
Each layout renders `<Outlet />` inside `.layout-{role}__content`. The layouts are designed
to be used as React Router v6 wrapper routes:
```jsx
<Route element={<LayoutAdmin />}>
  <Route path="/dashboard" element={<Dashboard />} />
  ...
</Route>
```
