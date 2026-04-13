import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import '../styles/Conductores.css'

const LICENCIAS = ['A1', 'A2', 'A3', 'B', 'C', 'D', 'F']

const ESTADO_INICIAL_PERFIL = {
  nombre: '',
  rut: '',
  telefono: '',
}

const ESTADO_INICIAL_DETALLE = {
  tipo_licencia: '',
  cod_licencia: '',
  fecha_vencimiento_licencia: '',
  años_experiencia: '',
}

export default function FormConductor({ conductor, onGuardado, onCerrar }) {
  const esEdicion = !!conductor

  const [perfil, setPerfil] = useState(ESTADO_INICIAL_PERFIL)
  const [detalle, setDetalle] = useState(ESTADO_INICIAL_DETALLE)
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  useEffect(() => {
    if (conductor) {
      setPerfil({
        nombre:   conductor.nombre   ?? '',
        rut:      conductor.rut      ?? '',
        telefono: conductor.telefono ?? '',
      })
      const d = conductor.conductor_detalle?.[0] ?? {}
      setDetalle({
        tipo_licencia:               d.tipo_licencia               ?? '',
        cod_licencia:                d.cod_licencia                ?? '',
        fecha_vencimiento_licencia:  d.fecha_vencimiento_licencia  ?? '',
        años_experiencia:            d.años_experiencia            ?? '',
      })
    }
  }, [conductor])

  function cambiarPerfil(campo, valor) {
    setPerfil(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => { const c = { ...prev }; delete c[campo]; return c })
  }

  function cambiarDetalle(campo, valor) {
    setDetalle(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => { const c = { ...prev }; delete c[campo]; return c })
  }

  function validar() {
    const e = {}
    if (!perfil.nombre.trim())    e.nombre    = 'El nombre es obligatorio'
    if (!perfil.rut.trim())       e.rut       = 'El RUT es obligatorio'
    if (!detalle.tipo_licencia)   e.tipo_licencia = 'Selecciona el tipo de licencia'
    if (!detalle.cod_licencia.trim()) e.cod_licencia = 'El código de licencia es obligatorio'
    if (!detalle.fecha_vencimiento_licencia) e.fecha_vencimiento_licencia = 'La fecha de vencimiento es obligatoria'
    if (detalle.años_experiencia === '' || detalle.años_experiencia < 0)
      e.años_experiencia = 'Ingresa los años de experiencia'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')

    const erroresValidacion = validar()
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setCargando(true)

    try {
      if (esEdicion) {
        // Actualizar perfil
        const { error: errorPerfil } = await supabase
          .from('perfil')
          .update({
            nombre:   perfil.nombre.trim(),
            rut:      perfil.rut.trim(),
            telefono: perfil.telefono.trim(),
          })
          .eq('id', conductor.id)

        if (errorPerfil) throw errorPerfil

        const detalleExistente = conductor.conductor_detalle?.[0]

        if (detalleExistente) {
          // Actualizar detalle existente
          const { error: errorDetalle } = await supabase
            .from('conductor_detalle')
            .update({
              tipo_licencia:              detalle.tipo_licencia,
              cod_licencia:               detalle.cod_licencia.trim(),
              fecha_vencimiento_licencia: detalle.fecha_vencimiento_licencia,
              años_experiencia:           Number(detalle.años_experiencia),
            })
            .eq('id', detalleExistente.id)

          if (errorDetalle) throw errorDetalle
        } else {
          // Crear detalle si no existía
          const { error: errorDetalle } = await supabase
            .from('conductor_detalle')
            .insert({
              id_perfil:                  conductor.id,
              tipo_licencia:              detalle.tipo_licencia,
              cod_licencia:               detalle.cod_licencia.trim(),
              fecha_vencimiento_licencia: detalle.fecha_vencimiento_licencia,
              años_experiencia:           Number(detalle.años_experiencia),
            })

          if (errorDetalle) throw errorDetalle
        }
      } else {
        // Crear perfil nuevo (conductor creado por admin, sin cuenta auth)
        const { data: nuevoPerfil, error: errorPerfil } = await supabase
          .from('perfil')
          .insert({
            nombre:       perfil.nombre.trim(),
            rut:          perfil.rut.trim(),
            telefono:     perfil.telefono.trim(),
            tipo_usuario: 'conductor',
            estado:       'aprobado',
          })
          .select()
          .single()

        if (errorPerfil) throw errorPerfil

        // Crear detalle del conductor
        const { error: errorDetalle } = await supabase
          .from('conductor_detalle')
          .insert({
            id_perfil:                  nuevoPerfil.id,
            tipo_licencia:              detalle.tipo_licencia,
            cod_licencia:               detalle.cod_licencia.trim(),
            fecha_vencimiento_licencia: detalle.fecha_vencimiento_licencia,
            años_experiencia:           Number(detalle.años_experiencia),
          })

        if (errorDetalle) throw errorDetalle
      }

      onGuardado()
    } catch (err) {
      console.error('Error al guardar conductor:', err)
      setErrorGeneral('Ocurrió un error al guardar. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box modal-box--form" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-form-header">
          <h2 className="modal-form-header__titulo">
            {esEdicion ? '✏️ Editar conductor' : '➕ Agregar conductor'}
          </h2>
          <button className="modal-form-header__cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        {errorGeneral && (
          <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-4)' }}>
            <span>⚠️</span><span>{errorGeneral}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Datos personales ── */}
          <p className="form-seccion-titulo">Datos personales</p>

          <div className="form-grid">
            <div className="form-field">
              <label className="sh-label" htmlFor="fc-nombre">Nombre completo</label>
              <input
                id="fc-nombre"
                type="text"
                className={`sh-input${errores.nombre ? ' sh-input--error' : ''}`}
                placeholder="Ej: Juan Pérez"
                value={perfil.nombre}
                onChange={e => cambiarPerfil('nombre', e.target.value)}
              />
              {errores.nombre && <span className="sh-field-error">⚠ {errores.nombre}</span>}
            </div>

            <div className="form-field">
              <label className="sh-label" htmlFor="fc-rut">RUT</label>
              <input
                id="fc-rut"
                type="text"
                className={`sh-input${errores.rut ? ' sh-input--error' : ''}`}
                placeholder="Ej: 12.345.678-9"
                value={perfil.rut}
                onChange={e => cambiarPerfil('rut', e.target.value)}
              />
              {errores.rut && <span className="sh-field-error">⚠ {errores.rut}</span>}
            </div>

            <div className="form-field">
              <label className="sh-label" htmlFor="fc-telefono">Teléfono</label>
              <input
                id="fc-telefono"
                type="text"
                className="sh-input"
                placeholder="Ej: +56 9 1234 5678"
                value={perfil.telefono}
                onChange={e => cambiarPerfil('telefono', e.target.value)}
              />
            </div>
          </div>

          {/* ── Datos de licencia ── */}
          <p className="form-seccion-titulo" style={{ marginTop: 'var(--space-6)' }}>Datos de licencia</p>

          <div className="form-grid">
            <div className="form-field">
              <label className="sh-label" htmlFor="fc-tipo-licencia">Tipo de licencia</label>
              <select
                id="fc-tipo-licencia"
                className={`sh-select${errores.tipo_licencia ? ' sh-input--error' : ''}`}
                value={detalle.tipo_licencia}
                onChange={e => cambiarDetalle('tipo_licencia', e.target.value)}
              >
                <option value="">Selecciona tipo</option>
                {LICENCIAS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errores.tipo_licencia && <span className="sh-field-error">⚠ {errores.tipo_licencia}</span>}
            </div>

            <div className="form-field">
              <label className="sh-label" htmlFor="fc-cod-licencia">Código de licencia</label>
              <input
                id="fc-cod-licencia"
                type="text"
                className={`sh-input${errores.cod_licencia ? ' sh-input--error' : ''}`}
                placeholder="Ej: B123456"
                value={detalle.cod_licencia}
                onChange={e => cambiarDetalle('cod_licencia', e.target.value)}
              />
              {errores.cod_licencia && <span className="sh-field-error">⚠ {errores.cod_licencia}</span>}
            </div>

            <div className="form-field">
              <label className="sh-label" htmlFor="fc-vencimiento">Fecha de vencimiento</label>
              <input
                id="fc-vencimiento"
                type="date"
                className={`sh-input${errores.fecha_vencimiento_licencia ? ' sh-input--error' : ''}`}
                value={detalle.fecha_vencimiento_licencia}
                onChange={e => cambiarDetalle('fecha_vencimiento_licencia', e.target.value)}
              />
              {errores.fecha_vencimiento_licencia && <span className="sh-field-error">⚠ {errores.fecha_vencimiento_licencia}</span>}
            </div>

            <div className="form-field">
              <label className="sh-label" htmlFor="fc-experiencia">Años de experiencia</label>
              <input
                id="fc-experiencia"
                type="number"
                min="0"
                max="50"
                className={`sh-input${errores.años_experiencia ? ' sh-input--error' : ''}`}
                placeholder="Ej: 5"
                value={detalle.años_experiencia}
                onChange={e => cambiarDetalle('años_experiencia', e.target.value)}
              />
              {errores.años_experiencia && <span className="sh-field-error">⚠ {errores.años_experiencia}</span>}
            </div>
          </div>

          {/* Acciones */}
          <div className="modal-box__acciones" style={{ marginTop: 'var(--space-8)' }}>
            <button type="button" className="sh-btn-ghost" onClick={onCerrar} disabled={cargando} style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" className="sh-btn" disabled={cargando} style={{ flex: 1 }}>
              {cargando
                ? <><span className="sh-spinner" /> Guardando...</>
                : esEdicion ? '💾 Guardar cambios' : '➕ Agregar conductor'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
