import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import MapaRuta from '../components/MapaRuta'
import ModalConfirmar from '../components/ModalConfirmar'
import '../styles/Rutas.css'
import ChatWidget from '../components/ChatWidget'

const FORM_VACIO = {
  punto_inicio: '',
  punto_final:  '',
  descripcion_ruta: '',
  duracion: '',
  horario_salida: '',
  id_furgon: '',
  lat_inicio:  null,
  lng_inicio:  null,
  lat_final:   null,
  lng_final:   null,
}

export default function Rutas() {
  const [rutas, setRutas]       = useState([])
  const [furgones, setFurgones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)
  const [toast, setToast]       = useState(null)

  const [formAbierto, setFormAbierto]     = useState(false)
  const [editando, setEditando]           = useState(null)   // null = nueva ruta
  const [form, setForm]                   = useState(FORM_VACIO)
  const [guardando, setGuardando]         = useState(false)
  const [errForm, setErrForm]             = useState(null)

  const [eliminando, setEliminando]       = useState(null)
  const [elimCargando, setElimCargando]   = useState(false)

  // ── Carga ───────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      const [{ data: rutasData, error: errR }, { data: furgData, error: errF }] =
        await Promise.all([
          supabase
            .from('ruta')
            .select('*, furgon!id_furgon(id, matricula, marca, modelo, perfil!furgon_id_conductor_fkey(nombre))')
            .order('punto_inicio'),
          supabase
            .from('furgon')
            .select('id, matricula, marca, modelo')
            .order('matricula'),
        ])

      if (errR) throw errR
      if (errF) throw errF
      setRutas(rutasData ?? [])
      setFurgones(furgData ?? [])
    } catch (err) {
      console.error('Error al cargar rutas:', err)
      setError('No se pudieron cargar las rutas. Intenta recargar la página.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ── Toast ───────────────────────────────────────────────────

  function mostrarToast(tipo, mensaje) {
    setToast({ tipo, mensaje })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Abrir / cerrar form ─────────────────────────────────────

  function handleNueva() {
    setEditando(null)
    setForm(FORM_VACIO)
    setErrForm(null)
    setFormAbierto(true)
  }

  function handleEditar(ruta) {
    setEditando(ruta)
    setForm({
      punto_inicio:     ruta.punto_inicio     ?? '',
      punto_final:      ruta.punto_final      ?? '',
      descripcion_ruta: ruta.descripcion_ruta ?? '',
      duracion:         ruta.duracion         ?? '',
      horario_salida:   ruta.horario_salida   ?? '',
      id_furgon:        ruta.id_furgon        ?? '',
      lat_inicio:       ruta.lat_inicio       ?? null,
      lng_inicio:       ruta.lng_inicio       ?? null,
      lat_final:        ruta.lat_final        ?? null,
      lng_final:        ruta.lng_final        ?? null,
    })
    setErrForm(null)
    setFormAbierto(true)
  }

  function handleCerrar() {
    setFormAbierto(false)
    setEditando(null)
    setForm(FORM_VACIO)
    setErrForm(null)
  }

  // ── Guardar ─────────────────────────────────────────────────

  async function handleGuardar(e) {
    e.preventDefault()

    if (!form.lat_inicio || !form.lat_final) {
      setErrForm('Debes seleccionar el punto de inicio y el punto de destino en el mapa.')
      return
    }
    if (!form.id_furgon) {
      setErrForm('Debes seleccionar un furgón para esta ruta.')
      return
    }

    setGuardando(true)
    setErrForm(null)

    const payload = {
      punto_inicio:     form.punto_inicio,
      punto_final:      form.punto_final,
      descripcion_ruta: form.descripcion_ruta || null,
      duracion:         form.duracion         || null,
      horario_salida:   form.horario_salida   || null,
      id_furgon:        form.id_furgon,
      lat_inicio:       form.lat_inicio,
      lng_inicio:       form.lng_inicio,
      lat_final:        form.lat_final,
      lng_final:        form.lng_final,
    }

    try {
      if (editando) {
        const { error: err } = await supabase
          .from('ruta')
          .update(payload)
          .eq('id', editando.id)
        if (err) throw err
        mostrarToast('success', 'Ruta actualizada correctamente.')
      } else {
        const { error: err } = await supabase
          .from('ruta')
          .insert(payload)
        if (err) throw err
        mostrarToast('success', 'Ruta creada correctamente.')
      }
      handleCerrar()
      await cargar()
    } catch (err) {
      console.error('Error al guardar ruta:', err)
      setErrForm('No se pudo guardar la ruta. Intenta nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  // ── Eliminar ────────────────────────────────────────────────

  async function handleConfirmarEliminar() {
    if (!eliminando) return
    setElimCargando(true)
    try {
      const { error: err } = await supabase
        .from('ruta')
        .delete()
        .eq('id', eliminando.id)
      if (err) throw err
      mostrarToast('success', 'Ruta eliminada.')
      setEliminando(null)
      await cargar()
    } catch (err) {
      console.error('Error al eliminar ruta:', err)
      mostrarToast('error', 'No se pudo eliminar la ruta.')
    } finally {
      setElimCargando(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="rutas-page">

      {toast && (
        <div className={`rutas-toast rutas-toast--${toast.tipo}`}>
          {toast.tipo === 'success' ? '✅' : '⚠️'} {toast.mensaje}
        </div>
      )}

      <div className="rutas-header">
        <div>
          <h1 className="rutas-header__titulo">🗺️ Rutas</h1>
          <p className="rutas-header__sub">
            {cargando ? 'Cargando...' : `${rutas.length} ruta${rutas.length !== 1 ? 's' : ''} registrada${rutas.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          className="sh-btn"
          style={{ width: 'auto', padding: '10px 20px' }}
          onClick={handleNueva}
        >
          ➕ Nueva ruta
        </button>
      </div>

      {error && (
        <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-4)' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {cargando ? (
        <div className="rutas-loading">
          <div className="sh-spinner sh-spinner--dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p>Cargando rutas...</p>
        </div>
      ) : rutas.length === 0 ? (
        <div className="rutas-empty">
          <div className="rutas-empty__icon">🗺️</div>
          <p className="rutas-empty__titulo">Sin rutas registradas</p>
          <p className="rutas-empty__msg">Crea la primera ruta para un furgón.</p>
          <button className="sh-btn" style={{ width: 'auto', padding: '10px 24px' }} onClick={handleNueva}>
            ➕ Crear ruta
          </button>
        </div>
      ) : (
        <div className="rutas-tabla-wrapper">
          <table className="rutas-tabla">
            <thead>
              <tr>
                <th>Desde → Hasta</th>
                <th>Furgón</th>
                <th>Conductor</th>
                <th>Horario</th>
                <th>Duración</th>
                <th>Mapa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rutas.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="rutas-tabla__ruta">
                      <span className="rutas-tabla__pin rutas-tabla__pin--a">A</span>
                      <span className="rutas-tabla__punto">{r.punto_inicio || '—'}</span>
                      <span className="rutas-tabla__flecha">→</span>
                      <span className="rutas-tabla__pin rutas-tabla__pin--b">B</span>
                      <span className="rutas-tabla__punto">{r.punto_final || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="rutas-tabla__matricula">
                      {r.furgon?.matricula || '—'}
                    </span>
                    {r.furgon && (
                      <span className="rutas-tabla__modelo">
                        {r.furgon.marca} {r.furgon.modelo}
                      </span>
                    )}
                  </td>
                  <td>{r.furgon?.perfil?.nombre || <em style={{ color: 'var(--color-text-muted)' }}>Sin conductor</em>}</td>
                  <td>{r.horario_salida || '—'}</td>
                  <td>{r.duracion || '—'}</td>
                  <td>
                    {r.lat_inicio && r.lat_final
                      ? <span className="rutas-tabla__badge-mapa">✅ Con mapa</span>
                      : <span className="rutas-tabla__badge-mapa rutas-tabla__badge-mapa--sin">Sin coords</span>}
                  </td>
                  <td>
                    <div className="rutas-tabla__acciones">
                      <button
                        className="sh-btn-ghost"
                        onClick={() => handleEditar(r)}
                        title="Editar"
                      >✏️</button>
                      <button
                        className="sh-btn-danger"
                        onClick={() => setEliminando(r)}
                        title="Eliminar"
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal formulario ───────────────────────────────── */}
      {formAbierto && (
        <div className="modal-overlay" onClick={handleCerrar}>
          <div
            className="modal-box modal-box--form rutas-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="rutas-modal__header">
              <h2>{editando ? 'Editar ruta' : 'Nueva ruta'}</h2>
              <button
                className="sh-btn-ghost"
                onClick={handleCerrar}
                aria-label="Cerrar"
              >✕</button>
            </div>

            <form onSubmit={handleGuardar} className="rutas-modal__form">

              {/* Selector de furgón */}
              <div className="sh-field">
                <label className="sh-label">Furgón *</label>
                <select
                  className="sh-select"
                  value={form.id_furgon}
                  onChange={e => setForm(p => ({ ...p, id_furgon: e.target.value }))}
                  required
                >
                  <option value="">Selecciona un furgón...</option>
                  {furgones.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.matricula} — {f.marca} {f.modelo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mapa con búsqueda */}
              <div className="sh-field">
                <MapaRuta
                  modo="editable"
                  coordenadas={form}
                  onChange={coords => setForm(p => ({ ...p, ...coords }))}
                />
              </div>

              {/* Fila descripción + horario + duración */}
              <div className="rutas-modal__fila">
                <div className="sh-field">
                  <label className="sh-label">Descripción</label>
                  <input
                    type="text"
                    className="sh-input"
                    placeholder="Ej: Ruta norte sector Las Condes"
                    value={form.descripcion_ruta}
                    onChange={e => setForm(p => ({ ...p, descripcion_ruta: e.target.value }))}
                  />
                </div>
                <div className="sh-field">
                  <label className="sh-label">Horario de salida</label>
                  <input
                    type="time"
                    className="sh-input"
                    value={form.horario_salida}
                    onChange={e => setForm(p => ({ ...p, horario_salida: e.target.value }))}
                  />
                </div>
                <div className="sh-field">
                  <label className="sh-label">Duración estimada</label>
                  <input
                    type="text"
                    className="sh-input"
                    placeholder="Ej: 35 min"
                    value={form.duracion}
                    onChange={e => setForm(p => ({ ...p, duracion: e.target.value }))}
                  />
                </div>
              </div>

              {errForm && (
                <div className="sh-alert sh-alert--error">
                  <span>⚠️</span><span>{errForm}</span>
                </div>
              )}

              <div className="rutas-modal__footer">
                <button
                  type="button"
                  className="sh-btn-ghost"
                  onClick={handleCerrar}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="sh-btn"
                  style={{ width: 'auto', padding: '10px 28px' }}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear ruta'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── Modal confirmar eliminar ───────────────────────── */}
      {eliminando && (
        <ModalConfirmar
          titulo="Eliminar ruta"
          mensaje={`¿Eliminar la ruta "${eliminando.punto_inicio} → ${eliminando.punto_final}"? Esta acción no se puede deshacer.`}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setEliminando(null)}
          cargando={elimCargando}
        />
      )}

      <ChatWidget />
    </div>
  )
}
