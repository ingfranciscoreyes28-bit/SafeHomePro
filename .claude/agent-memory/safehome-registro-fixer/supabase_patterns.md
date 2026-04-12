---
name: Supabase usage patterns in SafeHome
description: How the supabase client is imported, called, and error-handled across all pages
type: reference
---

**Import pattern (all pages):**
```js
import { supabase } from '../services/supabase'
```
Always a named export `{ supabase }`, never a default import.

**Auth calls:**
- Registration: `supabase.auth.signUp({ email, password, options: { data: { ... } } })`
- Login: `supabase.auth.signInWithPassword({ email, password })`
- Logout: `supabase.auth.signOut()`
- Session: `supabase.auth.onAuthStateChange((_event, session) => ...)` — preferred over `getSession` to avoid double-calls

**Data calls pattern:**
```js
const { data, error } = await supabase.from('table').select/insert/update/delete(...)
if (error) { /* handle */ }
```
Always destructure both `data` and `error`. Never ignore the result of a write operation.

**`.single()` behavior:**
- Returns PGRST116 error code when no rows match (not a JS exception)
- Returns data normally when exactly one row matches
- Treat PGRST116 as "not found" (not a fatal error) — see AuthContext pattern
