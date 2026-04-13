---
name: SafeHome — estructura real del codebase (formularios y servicios)
description: Nombres reales de estado, funciones submit, patron de errores y exports en los archivos clave de SafeHome
type: project
---

## supabase.js
- Export nombrado: `export const supabase = createClient(...)`
- Import correcto desde services/: `import { supabase } from './supabase'`
- Import correcto desde components/: `import { supabase } from '../services/supabase'`

## FormConductor.jsx
- Props: `{ conductor, onGuardado, onCerrar }`
- `esEdicion = !!conductor`
- Estado perfil: objeto `{ nombre, rut, telefono }` via `setPerfil`
- Estado detalle: objeto `{ tipo_licencia, cod_licencia, fecha_vencimiento_licencia, años_experiencia }` via `setDetalle`
- Errores de campo: objeto `errores` via `setErrores`
- Loading: `cargando` / `setCargando`
- Error general: `errorGeneral` / `setErrorGeneral` — mostrado con `.sh-alert.sh-alert--error`
- Submit: funcion `handleSubmit(e)`
- ID del conductor en edicion: `conductor.id`
- Foto existente del conductor: `conductor.foto` (columna en tabla perfil)
- NO tenia nada de fotos al momento de la primera lectura (2026-04-13)

## FormFurgon.jsx
- Props: `{ furgon, onGuardado, onCerrar }`
- `esEdicion = !!furgon`
- Estado principal: objeto `campos` con `{ matricula, marca, modelo, anio, capacidad, id_conductor }` via `setCampos`
- Errores: objeto `errores` / `setErrores`
- Loading: `cargando` / `setCargando`
- Error general: `errorGeneral` / `setErrorGeneral` — mismo patron de alerta
- Submit: funcion `handleSubmit(e)`
- Payload construido como objeto `payload` antes del try
- ID del furgon en edicion: `furgon.id`
- Foto existente: `furgon.foto_furgon` (columna en tabla furgon)
- NO tenia nada de fotos al momento de la primera lectura (2026-04-13)

## Archivos creados en esta sesion (2026-04-13)
- `src/services/storage.js` — funciones `subirFoto` y `eliminarFoto`
- `src/components/InputFoto.jsx` — componente de preview/seleccion, NO sube
- `src/styles/InputFoto.css` — estilos del componente

## Integracion de fotos completada (2026-04-13)
- FormConductor: agrega `archivoFoto` state, importa InputFoto y subirFoto, InputFoto renderizado al inicio del form
- FormFurgon: idem. Adicionalmente el insert original NO usaba .select().single() — se agrego para obtener el id del nuevo furgon y poder subir la foto en modo creacion
- En modo creacion, la foto se sube DESPUES del insert (necesita el id nuevo), via un segundo update a la fila recien creada
- Si la foto falla en modo creacion (el registro ya existe), se llama onGuardado() de todas formas con mensaje de aviso — no se revierte el registro
- En modo edicion, la foto se sube ANTES del update del perfil/furgon, y su URL se incluye directamente en el mismo update

**Why:** Francisco implemento la integracion con los formularios el 2026-04-13
**How to apply:** Al modificar FormConductor o FormFurgon, respetar los nombres de estado documentados arriba exactamente
