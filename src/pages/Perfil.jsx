import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import '../styles/Perfil.css'

function Toast({ mensaje, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`perfil-toast perfil-toast--${tipo}`}>
      {tipo === 'success' ? '✅' : '❌'} {mensaje}
    </div>
  )
}

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Perfil() {
  const { perfil, usuario, cerrarSesion } = useAuth()

  // Campos editables
  const [nombre,   setNombre]   = useState('')
  const [rut,      setRut]      = useState('')
  const [telefono, setTelefono] = useState('')

  // Datos del conductor (solo lectura)
  const [detalle, setDetalle] = useState(null)

  const [guardando, setGuardando]       = useState(false)
  const [errores, setErrores]           = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [toast, setToast]               = useState(null)

  // Inicializar campos con el perfil actual
  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre   ?? '')
      setRut(perfil.rut         ?? '')
      setTelefono(perfil.telefono ?? '')
    }
  }, [perfil])

  // Cargar conductor_detalle si es conductor
  const cargarDetalle = useCallback(async () => {
    if (perfil?.tipo_usuario !== 'conductor') return
    const { data, error } = await supabase
      .from('conductor_detalle')
      .select('*')
      .eq('id_perfil', perfil.id)
      .maybeSingle()
    if (!error) setDetalle(data)
  }, [perfil?.id, perfil?.tipo_usuario])

  useEffect(() => { cargarDetalle() }, [cargarDetalle])

  function validar() {
    const e = {}
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio'
    return e
  }

  async function handleGuardar(ev) {
    ev.preventDefault()
    setErrorGeneral('')
    const ev2 = validar()
    setErrores(ev2)
    if (Object.keys(ev2).length > 0) return

    setGuardando(true)
    const { error } = await supabase
      .from('perfil')
      .update({
        nombre:   nombre.trim(),
        rut:      rut.trim()      || null,
        telefono: telefono.trim() || null,
      })
      .eq('id', perfil.id)

    setGuardando(false)
    if (error) {
      setErrorGeneral('Error al guardar los cambios. Intenta nuevamente.')
      return
    }
    setToast({ mensaje: 'Perfil actualizado correctamente', tipo: 'success' })
  }

  const inicial = perfil?.nombre?.[0]?.toUpperCase() ?? '?'
  const esConductor = perfil?.tipo_usuario === 'conductor'
  const esApoderado = perfil?.tipo_usuario === 'apoderado'

  return (
    <div className="perfil-page">
      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}

      {/* Hero */}
      <div className="perfil-hero">
        <div className="perfil-hero__avatar">{inicial}</div>
        <div className="perfil-hero__info">
          <div className="perfil-hero__nombre">{perfil?.nombre || 'Mi perfil'}</div>
          <div className="perfil-hero__email">{usuario?.email || '—'}</div>
          {esConductor && (
            <span className="sh-badge sh-badge--conductor" style={{ marginTop: 4 }}>
              👨‍✈️ Conductor
            </span>
          )}
          {esApoderado && (
            <span className="sh-badge sh-badge--apoderado" style={{ marginTop: 4 }}>
              👨‍👩‍👧 Apoderado
            </span>
          )}
        </div>
      </div>

      {/* Formulario datos personales */}
      <form onSubmit={handleGuardar} noValidate>
        <div className="perfil-seccion">
          <div className="perfil-seccion__titulo">Datos personales</div>

          {errorGeneral && (
            <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-4)' }}>
              <span>⚠️</span><span>{errorGeneral}</span>
            </div>
          )}

          <div className="perfil-form-grid">

            <div className="perfil-form-field perfil-form-field--full">
              <label className="sh-label" htmlFor="pf-nombre">Nombre completo</label>
              <input
                id="pf-nombre"
                type="text"
                className={`sh-input${errores.nombre ? ' sh-input--error' : ''}`}
                placeholder="Tu nombre completo"
                value={nombre}
                onChange={e => { setNombre(e.target.value); if (errores.nombre) setErrores({}) }}
              />
              {errores.nombre && <span className="sh-field-error">⚠ {errores.nombre}</span>}
            </div>

            <div className="perfil-form-field">
              <label className="sh-label" htmlFor="pf-rut">RUT</label>
              <input
                id="pf-rut"
                type="text"
                className="sh-input"
                placeholder="Ej: 12.345.678-9"
                value={rut}
                onChange={e => setRut(e.target.value)}
              />
            </div>

            <div className="perfil-form-field">
              <label className="sh-label" htmlFor="pf-tel">Teléfono</label>
              <input
                id="pf-tel"
                type="text"
                className="sh-input"
                placeholder="Ej: +56912345678"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
              />
            </div>

            <div className="perfil-form-field perfil-form-field--full">
              <label className="sh-label" htmlFor="pf-email">Correo electrónico</label>
              <input
                id="pf-email"
                type="email"
                className="perfil-input-readonly"
                value={usuario?.email || ''}
                readOnly
                tabIndex={-1}
              />
            </div>

          </div>
        </div>

        {/* Datos de licencia (solo conductor, solo lectura) */}
        {esConductor && (
          <div className="perfil-seccion">
            <div className="perfil-seccion__titulo">Datos de licencia</div>
            {!detalle ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No se encontraron datos de licencia registrados.
              </p>
            ) : (
              <div className="perfil-licencia-grid">
                <div className="perfil-licencia-item">
                  <span className="perfil-licencia-label">Tipo de licencia</span>
                  <span className="perfil-licencia-valor perfil-licencia-valor--destac">
                    {detalle.tipo_licencia || '—'}
                  </span>
                </div>
                <div className="perfil-licencia-item">
                  <span className="perfil-licencia-label">Código licencia</span>
                  <span className="perfil-licencia-valor">{detalle.cod_licencia || '—'}</span>
                </div>
                <div className="perfil-licencia-item">
                  <span className="perfil-licencia-label">Vencimiento</span>
                  <span className="perfil-licencia-valor">{formatFecha(detalle.fecha_vencimiento_licencia)}</span>
                </div>
                <div className="perfil-licencia-item">
                  <span className="perfil-licencia-label">Años de experiencia</span>
                  <span className="perfil-licencia-valor">
                    {detalle.años_experiencia != null
                      ? `${detalle.años_experiencia} año${detalle.años_experiencia !== 1 ? 's' : ''}`
                      : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="perfil-acciones">
          <button
            type="submit"
            className="sh-btn"
            disabled={guardando}
            style={{ flex: 1 }}
          >
            {guardando ? <><span className="sh-spinner" /> Guardando...</> : '💾 Guardar cambios'}
          </button>
          <button
            type="button"
            className="sh-btn-danger"
            onClick={cerrarSesion}
            style={{ flexShrink: 0 }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </form>
    </div>
  )
}
