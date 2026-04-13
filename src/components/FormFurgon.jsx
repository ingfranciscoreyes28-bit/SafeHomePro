import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import '../styles/Furgones.css'
import '../styles/Conductores.css'

const ESTADO_INICIAL = {
  matricula:    '',
  marca:        '',
  modelo:       '',
  anio:         '',
  capacidad:    '',
  id_conductor: '',
}

export default function FormFurgon({ furgon, onGuardado, onCerrar }) {
  const esEdicion = !!furgon

  const [campos, setCampos]         = useState(ESTADO_INICIAL)
  const [conductores, setConductores] = useState([])
  const [errores, setErrores]       = useState({})
  const [cargando, setCargando]     = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  // Cargar conductores aprobados para el select
  useEffect(() => {
    async function cargarConductores() {
      const { data } = await supabase
        .from('perfil')
        .select('id, nombre')
        .eq('tipo_usuario', 'conductor')
        .eq('estado', 'aprobado')
        .order('nombre', { ascending: true })
      setConductores(data ?? [])
    }
    cargarConductores()
  }, [])

  // Rellenar campos en modo edición
  useEffect(() => {
    if (furgon) {
      setCampos({
        matricula:    furgon.matricula    ?? '',
        marca:        furgon.marca        ?? '',
        modelo:       furgon.modelo       ?? '',
        anio:         furgon.anio         ?? '',
        capacidad:    furgon.capacidad    ?? '',
        id_conductor: furgon.id_conductor ?? '',
      })
    }
  }, [furgon])

  function cambiar(campo, valor) {
    setCampos(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => { const c = { ...prev }; delete c[campo]; return c })
    if (errorGeneral) setErrorGeneral('')
  }

  function validar() {
    const e = {}
    if (!campos.matricula.trim()) e.matricula = 'La matrícula es obligatoria'
    if (!campos.marca.trim())     e.marca     = 'La marca es obligatoria'
    if (!campos.modelo.trim())    e.modelo    = 'El modelo es obligatorio'
    if (!campos.anio)             e.anio      = 'El año es obligatorio'
    else if (Number(campos.anio) < 1990 || Number(campos.anio) > new Date().getFullYear() + 1)
      e.anio = 'Ingresa un año válido'
    if (!campos.capacidad)        e.capacidad = 'La capacidad es obligatoria'
    else if (Number(campos.capacidad) < 1 || Number(campos.capacidad) > 50)
      e.capacidad = 'La capacidad debe ser entre 1 y 50'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')

    const erroresValidacion = validar()
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setCargando(true)

    const payload = {
      matricula:    campos.matricula.trim().toUpperCase(),
      marca:        campos.marca.trim(),
      modelo:       campos.modelo.trim(),
      anio:         Number(campos.anio),
      capacidad:    Number(campos.capacidad),
      id_conductor: campos.id_conductor || null,
    }

    try {
      if (esEdicion) {
        const { error } = await supabase
          .from('furgon')
          .update(payload)
          .eq('id', furgon.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('furgon')
          .insert(payload)
        if (error) throw error
      }
      onGuardado()
    } catch (err) {
      console.error('Error al guardar furgón:', err)
      if (err.code === '23505') {
        setErrores(prev => ({ ...prev, matricula: 'Ya existe un furgón con esta matrícula' }))
      } else {
        setErrorGeneral('Ocurrió un error al guardar. Intenta nuevamente.')
      }
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
            {esEdicion ? '✏️ Editar furgón' : '➕ Agregar furgón'}
          </h2>
          <button className="modal-form-header__cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        {errorGeneral && (
          <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-4)' }}>
            <span>⚠️</span><span>{errorGeneral}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          <div className="furgon-form-grid">

            {/* Matrícula */}
            <div className="furgon-form-field">
              <label className="sh-label" htmlFor="ff-matricula">Matrícula</label>
              <input
                id="ff-matricula"
                type="text"
                className={`sh-input${errores.matricula ? ' sh-input--error' : ''}`}
                placeholder="Ej: ABCD-12"
                value={campos.matricula}
                onChange={e => cambiar('matricula', e.target.value)}
              />
              {errores.matricula && <span className="sh-field-error">⚠ {errores.matricula}</span>}
            </div>

            {/* Marca */}
            <div className="furgon-form-field">
              <label className="sh-label" htmlFor="ff-marca">Marca</label>
              <input
                id="ff-marca"
                type="text"
                className={`sh-input${errores.marca ? ' sh-input--error' : ''}`}
                placeholder="Ej: Mercedes-Benz"
                value={campos.marca}
                onChange={e => cambiar('marca', e.target.value)}
              />
              {errores.marca && <span className="sh-field-error">⚠ {errores.marca}</span>}
            </div>

            {/* Modelo */}
            <div className="furgon-form-field">
              <label className="sh-label" htmlFor="ff-modelo">Modelo</label>
              <input
                id="ff-modelo"
                type="text"
                className={`sh-input${errores.modelo ? ' sh-input--error' : ''}`}
                placeholder="Ej: Sprinter"
                value={campos.modelo}
                onChange={e => cambiar('modelo', e.target.value)}
              />
              {errores.modelo && <span className="sh-field-error">⚠ {errores.modelo}</span>}
            </div>

            {/* Año */}
            <div className="furgon-form-field">
              <label className="sh-label" htmlFor="ff-anio">Año</label>
              <input
                id="ff-anio"
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                className={`sh-input${errores.anio ? ' sh-input--error' : ''}`}
                placeholder={`Ej: ${new Date().getFullYear()}`}
                value={campos.anio}
                onChange={e => cambiar('anio', e.target.value)}
              />
              {errores.anio && <span className="sh-field-error">⚠ {errores.anio}</span>}
            </div>

            {/* Capacidad */}
            <div className="furgon-form-field">
              <label className="sh-label" htmlFor="ff-capacidad">Capacidad (pasajeros)</label>
              <input
                id="ff-capacidad"
                type="number"
                min="1"
                max="50"
                className={`sh-input${errores.capacidad ? ' sh-input--error' : ''}`}
                placeholder="Ej: 15"
                value={campos.capacidad}
                onChange={e => cambiar('capacidad', e.target.value)}
              />
              {errores.capacidad && <span className="sh-field-error">⚠ {errores.capacidad}</span>}
            </div>

            {/* Conductor */}
            <div className="furgon-form-field">
              <label className="sh-label" htmlFor="ff-conductor">Conductor asignado</label>
              <select
                id="ff-conductor"
                className="sh-select"
                value={campos.id_conductor}
                onChange={e => cambiar('id_conductor', e.target.value)}
              >
                <option value="">Sin asignar</option>
                {conductores.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
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
                : esEdicion ? '💾 Guardar cambios' : '➕ Agregar furgón'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
