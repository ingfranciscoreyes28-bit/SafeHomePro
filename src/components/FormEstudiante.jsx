import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import '../styles/Estudiantes.css'
import '../styles/Conductores.css'

const INICIAL = {
  nombre_estudiante: '',
  rut_estudiante:    '',
  fecha_nacimiento:  '',
  curso:             '',
  colegio:           '',
  id_apoderado:      '',
  id_furgon:         '',
}

export default function FormEstudiante({ estudiante, onGuardado, onCerrar }) {
  const esEdicion = !!estudiante

  const [campos, setCampos]       = useState(INICIAL)
  const [apoderados, setApoderados] = useState([])
  const [furgones, setFurgones]   = useState([])
  const [errores, setErrores]     = useState({})
  const [cargando, setCargando]   = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  useEffect(() => {
    async function cargarOpciones() {
      const [resAp, resFu] = await Promise.all([
        supabase.from('perfil').select('id, nombre').eq('tipo_usuario', 'apoderado').order('nombre'),
        supabase.from('furgon').select('id, matricula, marca, modelo').order('marca'),
      ])
      setApoderados(resAp.data ?? [])
      setFurgones(resFu.data ?? [])
    }
    cargarOpciones()
  }, [])

  useEffect(() => {
    if (estudiante) {
      setCampos({
        nombre_estudiante: estudiante.nombre_estudiante ?? '',
        rut_estudiante:    estudiante.rut_estudiante    ?? '',
        fecha_nacimiento:  estudiante.fecha_nacimiento  ?? '',
        curso:             estudiante.curso             ?? '',
        colegio:           estudiante.colegio           ?? '',
        id_apoderado:      estudiante.id_apoderado      ?? '',
        id_furgon:         estudiante.id_furgon         ?? '',
      })
    }
  }, [estudiante])

  function cambiar(campo, valor) {
    setCampos(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => { const c = { ...prev }; delete c[campo]; return c })
    if (errorGeneral) setErrorGeneral('')
  }

  function validar() {
    const e = {}
    if (!campos.nombre_estudiante.trim()) e.nombre_estudiante = 'El nombre es obligatorio'
    if (!campos.rut_estudiante.trim())    e.rut_estudiante    = 'El RUT es obligatorio'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setErrorGeneral('')
    const erroresValidacion = validar()
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setCargando(true)
    const payload = {
      nombre_estudiante: campos.nombre_estudiante.trim(),
      rut_estudiante:    campos.rut_estudiante.trim(),
      fecha_nacimiento:  campos.fecha_nacimiento || null,
      curso:             campos.curso.trim() || null,
      colegio:           campos.colegio.trim() || null,
      id_apoderado:      campos.id_apoderado || null,
      id_furgon:         campos.id_furgon    || null,
    }

    try {
      if (esEdicion) {
        const { error } = await supabase.from('estudiante').update(payload).eq('id', estudiante.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('estudiante').insert(payload)
        if (error) throw error
      }
      onGuardado()
    } catch (err) {
      console.error('Error al guardar estudiante:', err)
      setErrorGeneral('Ocurrió un error al guardar. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box modal-box--form" onClick={ev => ev.stopPropagation()}>

        <div className="modal-form-header">
          <h2 className="modal-form-header__titulo">
            {esEdicion ? '✏️ Editar estudiante' : '➕ Agregar estudiante'}
          </h2>
          <button className="modal-form-header__cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        {errorGeneral && (
          <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-4)' }}>
            <span>⚠️</span><span>{errorGeneral}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="est-form-grid">

            <div className="est-form-field">
              <label className="sh-label" htmlFor="fe-nombre">Nombre del estudiante</label>
              <input id="fe-nombre" type="text"
                className={`sh-input${errores.nombre_estudiante ? ' sh-input--error' : ''}`}
                placeholder="Ej: Juan Pérez"
                value={campos.nombre_estudiante}
                onChange={e => cambiar('nombre_estudiante', e.target.value)} />
              {errores.nombre_estudiante && <span className="sh-field-error">⚠ {errores.nombre_estudiante}</span>}
            </div>

            <div className="est-form-field">
              <label className="sh-label" htmlFor="fe-rut">RUT</label>
              <input id="fe-rut" type="text"
                className={`sh-input${errores.rut_estudiante ? ' sh-input--error' : ''}`}
                placeholder="Ej: 12.345.678-9"
                value={campos.rut_estudiante}
                onChange={e => cambiar('rut_estudiante', e.target.value)} />
              {errores.rut_estudiante && <span className="sh-field-error">⚠ {errores.rut_estudiante}</span>}
            </div>

            <div className="est-form-field">
              <label className="sh-label" htmlFor="fe-nacimiento">Fecha de nacimiento</label>
              <input id="fe-nacimiento" type="date"
                className="sh-input"
                value={campos.fecha_nacimiento}
                onChange={e => cambiar('fecha_nacimiento', e.target.value)} />
            </div>

            <div className="est-form-field">
              <label className="sh-label" htmlFor="fe-curso">Curso</label>
              <input id="fe-curso" type="text"
                className="sh-input"
                placeholder="Ej: 5° Básico A"
                value={campos.curso}
                onChange={e => cambiar('curso', e.target.value)} />
            </div>

            <div className="est-form-field est-form-field--full">
              <label className="sh-label" htmlFor="fe-colegio">Colegio</label>
              <input id="fe-colegio" type="text"
                className="sh-input"
                placeholder="Ej: Colegio San Patricio"
                value={campos.colegio}
                onChange={e => cambiar('colegio', e.target.value)} />
            </div>

            <div className="est-form-field">
              <label className="sh-label" htmlFor="fe-apoderado">Apoderado</label>
              <select id="fe-apoderado" className="sh-select"
                value={campos.id_apoderado}
                onChange={e => cambiar('id_apoderado', e.target.value)}>
                <option value="">Sin asignar</option>
                {apoderados.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>

            <div className="est-form-field">
              <label className="sh-label" htmlFor="fe-furgon">Furgón</label>
              <select id="fe-furgon" className="sh-select"
                value={campos.id_furgon}
                onChange={e => cambiar('id_furgon', e.target.value)}>
                <option value="">Sin asignar</option>
                {furgones.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.matricula} — {f.marca} {f.modelo}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="modal-box__acciones" style={{ marginTop: 'var(--space-8)' }}>
            <button type="button" className="sh-btn-ghost" onClick={onCerrar} disabled={cargando} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="sh-btn" disabled={cargando} style={{ flex: 1 }}>
              {cargando ? <><span className="sh-spinner" /> Guardando...</> : esEdicion ? '💾 Guardar cambios' : '➕ Agregar estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
