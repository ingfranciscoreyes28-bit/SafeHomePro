---
name: SafeHome file structure and CSS architecture
description: Where files live, how CSS is organized, and the index.css conflict to handle
type: project
---

CSS architecture: all design tokens live in `src/styles/global.css`. Each page has its own CSS in `src/styles/PageName.css`. Each page JSX imports both `global.css` and its own CSS.

The Vite default `src/index.css` is still imported by `main.jsx` and contains a `#root` rule that constrains width to 1126px with centered text — this conflicts with full-screen page layouts. It is neutralized in `global.css` with `!important` overrides on the `#root` selector.

Pages: `src/pages/Login.jsx`, `src/pages/Registro.jsx`, `src/pages/Dashboard.jsx`
Context: `src/context/AuthContext.jsx`
Services: `src/services/supabase.js`
No `src/styles/` directory existed at project start — it must be created before writing CSS files.

**Why:** Knowing this prevents accidentally leaving the Vite default styles active and breaking full-screen layouts.

**How to apply:** Always include the `#root` override block in `global.css`. Always `mkdir -p src/styles` before writing CSS.
