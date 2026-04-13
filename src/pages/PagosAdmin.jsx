import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import TablaPagos from '../components/TablaPagos'
import ModalConfirmar from '../components/ModalConfirmar'
import '../styles/Pagos.css'
import '../styles/Conductores.css'
import ChatWidget from "../components/ChatWidget";

function Toast({ mensaje, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`pagos-toast pagos-toast--${tipo}`}>
      {tipo === 'success' ? '✅' : '❌'} {mensaje}
    </div>
  )
}

const FILTROS = [
  { key: 'todos',     label: 'Todos'     },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'pagado',    label: 'Pagado'    },
  { key: 'atrasado',  label: 'Atrasado'  },
]

const INICIAL_PAGO = {
  id_estudiante: '',
  id_apoderado:  '',
  monto:         '',
  metodo_pago:   '',
  descripcion:   '',
  estado_pago:   'pendiente',
  fecha_pago:    '',
}

export default function PagosAdmin() {
  const [pagos, setPagos]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro]     = useState('todos')

  // Para el formulario de registro
  const [formAbierto, setFormAbierto]   = useState(false)
  const [estudiantes, setEstudiantes]   = useState([])
  const [campos, setCampos]             = useState(INICIAL_PAGO)
  const [errores, setErrores]           = useState({})
  const [guardando, setGuardando]       = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  // Eliminar
  const [eliminando, setEliminando] = useState(null)
  const [borrando, setBorrando]     = useState(false)

  const [toast, setToast] = useState(null)

  function mostrarToast(mensaje, tipo = 'success') {
    setToast({ mensaje, tipo })
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('pago')
      .select('*, estudiante!id_estudiante(id, nombre_estudiante), perfil!id_apoderado(id, nombre)')
      .order('created_at', { ascending: false })
    if (!error) setPagos(data ?? [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Cargar estudiantes para el form
  useEffect(() => {
    if (!formAbierto) return
    supabase
      .from('estudiante')
      .select('id, nombre_estudiante, id_apoderado, perfil!id_apoderado(id, nombre)')
      .order('nombre_estudiante')
      .then(({ data }) => setEstudiantes(data ?? []))
  }, [formAbierto])

  const pagosFiltrados = pagos.filter(p =>
    filtro === 'todos' || p.estado_pago === filtro
  )

  // Cuando se elige un estudiante, auto-rellenar apoderado
  function cambiar(campo, valor) {
    if (campo === 'id_estudiante') {
      const est = estudiantes.find(e => e.id === valor)
      setCampos(prev => ({
        ...prev,
        id_estudiante: valor,
        id_apoderado:  est?.id_apoderado ?? '',
      }))
    } else {
      setCampos(prev => ({ ...prev, [campo]: valor }))
    }
    if (errores[campo]) setErrores(prev => { const c = { ...prev }; delete c[campo]; return c })
    if (errorGeneral) setErrorGeneral('')
  }

  function validar() {
    const e = {}
    if (!campos.id_estudiante) e.id_estudiante = 'Selecciona un estudiante'
    if (!campos.monto || isNaN(Number(campos.monto)) || Number(campos.monto) <= 0)
      e.monto = 'El monto debe ser un número mayor a 0'
    return e
  }

  async function handleGuardar(ev) {
    ev.preventDefault()
    setErrorGeneral('')
    const ev2 = validar()
    setErrores(ev2)
    if (Object.keys(ev2).length > 0) return

    setGuardando(true)
    const payload = {
      id_estudiante: campos.id_estudiante || null,
      id_apoderado:  campos.id_apoderado  || null,
      monto:         Number(campos.monto),
      metodo_pago:   campos.metodo_pago   || null,
      descripcion:   campos.descripcion.trim() || null,
      estado_pago:   campos.estado_pago,
      fecha_pago:    campos.fecha_pago    || null,
    }

    const { error } = await supabase.from('pago').insert(payload)
    setGuardando(false)
    if (error) {
      setErrorGeneral('Error al registrar el pago. Intenta nuevamente.')
      return
    }
    setFormAbierto(false)
    setCampos(INICIAL_PAGO)
    await cargar()
    mostrarToast('Pago registrado correctamente')
  }

  function cerrarForm() {
    setFormAbierto(false)
    setCampos(INICIAL_PAGO)
    setErrores({})
    setErrorGeneral('')
  }

  async function handleMarcarPagado(pago) {
    const { error } = await supabase
      .from('pago')
      .update({ estado_pago: 'pagado', fecha_pago: new Date().toISOString().split('T')[0] })
      .eq('id', pago.id)
    if (error) {
      mostrarToast('Error al actualizar el estado', 'error')
      return
    }
    await cargar()
    mostrarToast('Pago marcado como pagado')
  }

  function abrirEliminar(pago) { setEliminando(pago) }
  function cerrarEliminar() { setEliminando(null) }

  async function handleEliminar() {
    setBorrando(true)
    const { error } = await supabase.from('pago').delete().eq('id', eliminando.id)
    setBorrando(false)
    if (error) {
      cerrarEliminar()
      mostrarToast('Error al eliminar el pago', 'error')
      return
    }
    cerrarEliminar()
    await cargar()
    mostrarToast('Pago eliminado')
  }

  const nombreEstEliminando = eliminando?.estudiante?.nombre_estudiante ?? 'este registro'

  return (
    <div className="pagos-page">
      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}

      <div className="pagos-header">
        <div>
          <h1 className="pagos-header__titulo">Pagos</h1>
          <p className="pagos-header__sub">
            {pagos.length} pago{pagos.length !== 1 ? 's' : ''} registrado{pagos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="pagos-header__acciones">
          <button className="sh-btn" onClick={() => setFormAbierto(true)}>
            ➕ Registrar pago
          </button>
        </div>
      </div>

      <div className="pagos-filtros">
        {FILTROS.map(f => (
          <button
            key={f.key}
            className={`pago-filtro-btn${filtro === f.key ? ' pago-filtro-btn--activo' : ''}`}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="pagos-loading">
          <span className="sh-spinner" />
          <span>Cargando pagos...</span>
        </div>
      ) : (
        <TablaPagos
          pagos={pagosFiltrados}
          onMarcarPagado={handleMarcarPagado}
          onEliminar={abrirEliminar}
        />
      )}

      {/* Modal registrar pago */}
      {formAbierto && (
        <div className="modal-overlay" onClick={cerrarForm}>
          <div className="modal-box modal-box--form" onClick={ev => ev.stopPropagation()}>
            <div className="modal-form-header">
              <h2 className="modal-form-header__titulo">➕ Registrar pago</h2>
              <button className="modal-form-header__cerrar" onClick={cerrarForm} aria-label="Cerrar">✕</button>
            </div>

            {errorGeneral && (
              <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-4)' }}>
                <span>⚠️</span><span>{errorGeneral}</span>
              </div>
            )}

            <form onSubmit={handleGuardar} noValidate>
              <div className="pago-form-grid">

                <div className="pago-form-field pago-form-field--full">
                  <label className="sh-label" htmlFor="pg-estudiante">Estudiante</label>
                  <select id="pg-estudiante" className={`sh-select${errores.id_estudiante ? ' sh-input--error' : ''}`}
                    value={campos.id_estudiante}
                    onChange={e => cambiar('id_estudiante', e.target.value)}>
                    <option value="">Seleccionar estudiante...</option>
                    {estudiantes.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre_estudiante}</option>
                    ))}
                  </select>
                  {errores.id_estudiante && <span className="sh-field-error">⚠ {errores.id_estudiante}</span>}
                </div>

                {campos.id_apoderado && (
                  <div className="pago-form-field pago-form-field--full">
                    <label className="sh-label">Apoderado (auto)</label>
                    <input type="text" className="sh-input" readOnly
                      value={estudiantes.find(e => e.id === campos.id_estudiante)?.perfil?.nombre ?? '—'}
                      style={{ opacity: 0.7 }} />
                  </div>
                )}

                <div className="pago-form-field">
                  <label className="sh-label" htmlFor="pg-monto">Monto (CLP)</label>
                  <input id="pg-monto" type="number" min="1"
                    className={`sh-input${errores.monto ? ' sh-input--error' : ''}`}
                    placeholder="Ej: 50000"
                    value={campos.monto}
                    onChange={e => cambiar('monto', e.target.value)} />
                  {errores.monto && <span className="sh-field-error">⚠ {errores.monto}</span>}
                </div>

                <div className="pago-form-field">
                  <label className="sh-label" htmlFor="pg-estado">Estado</label>
                  <select id="pg-estado" className="sh-select"
                    value={campos.estado_pago}
                    onChange={e => cambiar('estado_pago', e.target.value)}>
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>

                <div className="pago-form-field">
                  <label className="sh-label" htmlFor="pg-metodo">Método de pago</label>
                  <select id="pg-metodo" className="sh-select"
                    value={campos.metodo_pago}
                    onChange={e => cambiar('metodo_pago', e.target.value)}>
                    <option value="">Sin especificar</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>

                <div className="pago-form-field">
                  <label className="sh-label" htmlFor="pg-fecha">Fecha de pago</label>
                  <input id="pg-fecha" type="date" className="sh-input"
                    value={campos.fecha_pago}
                    onChange={e => cambiar('fecha_pago', e.target.value)} />
                </div>

                <div className="pago-form-field pago-form-field--full">
                  <label className="sh-label" htmlFor="pg-desc">Descripción</label>
                  <input id="pg-desc" type="text" className="sh-input"
                    placeholder="Ej: Mensualidad marzo 2026"
                    value={campos.descripcion}
                    onChange={e => cambiar('descripcion', e.target.value)} />
                </div>

              </div>

              <div className="modal-box__acciones" style={{ marginTop: 'var(--space-8)' }}>
                <button type="button" className="sh-btn-ghost" onClick={cerrarForm} disabled={guardando} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="sh-btn" disabled={guardando} style={{ flex: 1 }}>
                  {guardando ? <><span className="sh-spinner" /> Guardando...</> : '💾 Registrar pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eliminando && (
        <ModalConfirmar
          titulo="Eliminar pago"
          mensaje={`¿Seguro que deseas eliminar el pago de ${nombreEstEliminando}? Esta acción no se puede deshacer.`}
          onConfirmar={handleEliminar}
          onCancelar={cerrarEliminar}
          cargando={borrando}
        />
      )}


<ChatWidget />
    </div>
  )
}
