import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import TablaApoderados from '../components/TablaApoderados'
import ModalConfirmar from '../components/ModalConfirmar'
import '../styles/Apoderados.css'
import '../styles/Conductores.css'
import ChatWidget from "../components/ChatWidget";

function Toast({ mensaje, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`apoderados-toast apoderados-toast--${tipo}`}>
      {tipo === 'success' ? '✅' : '❌'} {mensaje}
    </div>
  )
}

const INICIAL = { nombre: '', rut: '', telefono: '' }

export default function Apoderados() {
  const [apoderados, setApoderados] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [busqueda, setBusqueda]     = useState('')

  const [editando, setEditando]         = useState(null)
  const [campos, setCampos]             = useState(INICIAL)
  const [errores, setErrores]           = useState({})
  const [guardando, setGuardando]       = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  const [eliminando, setEliminando] = useState(null)
  const [borrando, setBorrando]     = useState(false)

  const [toast, setToast] = useState(null)

  function mostrarToast(mensaje, tipo = 'success') {
    setToast({ mensaje, tipo })
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('perfil')
      .select('id, nombre, rut, telefono, estado')
      .eq('tipo_usuario', 'apoderado')
      .order('nombre')
    if (!error) setApoderados(data ?? [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const apoderadosFiltrados = apoderados.filter(a =>
    !busqueda.trim() ||
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.rut?.toLowerCase().includes(busqueda.toLowerCase())
  )

  function abrirEditar(apoderado) {
    setEditando(apoderado)
    setCampos({ nombre: apoderado.nombre ?? '', rut: apoderado.rut ?? '', telefono: apoderado.telefono ?? '' })
    setErrores({})
    setErrorGeneral('')
  }
  function cerrarEditar() { setEditando(null) }

  function cambiar(campo, valor) {
    setCampos(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => { const c = { ...prev }; delete c[campo]; return c })
    if (errorGeneral) setErrorGeneral('')
  }

  function validar() {
    const e = {}
    if (!campos.nombre.trim()) e.nombre = 'El nombre es obligatorio'
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
        nombre:   campos.nombre.trim(),
        rut:      campos.rut.trim() || null,
        telefono: campos.telefono.trim() || null,
      })
      .eq('id', editando.id)

    setGuardando(false)
    if (error) {
      setErrorGeneral('Error al guardar. Intenta nuevamente.')
      return
    }
    cerrarEditar()
    await cargar()
    mostrarToast('Apoderado actualizado correctamente')
  }

  function abrirEliminar(apoderado) { setEliminando(apoderado) }
  function cerrarEliminar() { setEliminando(null) }

  async function handleEliminar() {
    setBorrando(true)
    const { error } = await supabase.from('perfil').delete().eq('id', eliminando.id)
    setBorrando(false)
    if (error) {
      cerrarEliminar()
      mostrarToast('Error al eliminar el apoderado', 'error')
      return
    }
    cerrarEliminar()
    await cargar()
    mostrarToast('Apoderado eliminado')
  }

  return (
    <div className="apoderados-page">
      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}

      <div className="apoderados-header">
        <div>
          <h1 className="apoderados-header__titulo">Apoderados</h1>
          <p className="apoderados-header__sub">
            {apoderados.length} apoderado{apoderados.length !== 1 ? 's' : ''} registrado{apoderados.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <input
          type="text"
          className="sh-input"
          placeholder="Buscar por nombre o RUT..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      {cargando ? (
        <div className="apoderados-loading">
          <span className="sh-spinner" />
          <span>Cargando apoderados...</span>
        </div>
      ) : (
        <TablaApoderados
          apoderados={apoderadosFiltrados}
          onEditar={abrirEditar}
          onEliminar={abrirEliminar}
        />
      )}

      {editando && (
        <div className="modal-overlay" onClick={cerrarEditar}>
          <div className="modal-box modal-box--form" onClick={ev => ev.stopPropagation()}>
            <div className="modal-form-header">
              <h2 className="modal-form-header__titulo">✏️ Editar apoderado</h2>
              <button className="modal-form-header__cerrar" onClick={cerrarEditar} aria-label="Cerrar">✕</button>
            </div>

            {errorGeneral && (
              <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-4)' }}>
                <span>⚠️</span><span>{errorGeneral}</span>
              </div>
            )}

            <form onSubmit={handleGuardar} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <label className="sh-label" htmlFor="ap-nombre">Nombre completo</label>
                  <input id="ap-nombre" type="text"
                    className={`sh-input${errores.nombre ? ' sh-input--error' : ''}`}
                    placeholder="Ej: María González"
                    value={campos.nombre}
                    onChange={e => cambiar('nombre', e.target.value)} />
                  {errores.nombre && <span className="sh-field-error">⚠ {errores.nombre}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <label className="sh-label" htmlFor="ap-rut">RUT</label>
                    <input id="ap-rut" type="text"
                      className="sh-input"
                      placeholder="Ej: 12.345.678-9"
                      value={campos.rut}
                      onChange={e => cambiar('rut', e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <label className="sh-label" htmlFor="ap-telefono">Teléfono</label>
                    <input id="ap-telefono" type="text"
                      className="sh-input"
                      placeholder="Ej: +56912345678"
                      value={campos.telefono}
                      onChange={e => cambiar('telefono', e.target.value)} />
                  </div>
                </div>

              </div>

              <div className="modal-box__acciones" style={{ marginTop: 'var(--space-8)' }}>
                <button type="button" className="sh-btn-ghost" onClick={cerrarEditar} disabled={guardando} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="sh-btn" disabled={guardando} style={{ flex: 1 }}>
                  {guardando ? <><span className="sh-spinner" /> Guardando...</> : '💾 Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eliminando && (
        <ModalConfirmar
          titulo="Eliminar apoderado"
          mensaje={`¿Seguro que deseas eliminar a ${eliminando.nombre}? Esta acción no se puede deshacer.`}
          onConfirmar={handleEliminar}
          onCancelar={cerrarEliminar}
          cargando={borrando}
        />
      )}

      
    <ChatWidget />
    </div>
  )
}
