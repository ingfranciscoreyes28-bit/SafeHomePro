import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import TablaFurgones from '../components/TablaFurgones'
import FormFurgon from '../components/FormFurgon'
import ModalConfirmar from '../components/ModalConfirmar'
import '../styles/global.css'
import '../styles/Furgones.css'

export default function Furgones() {
  const [furgones, setFurgones]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const [formAbierto, setFormAbierto]         = useState(false)
  const [furgonEditando, setFurgonEditando]   = useState(null)
  const [furgonEliminando, setFurgonEliminando] = useState(null)
  const [eliminandoCargando, setEliminandoCargando] = useState(false)

  const [toast, setToast] = useState(null)

  // ── Carga ───────────────────────────────────────────────────

  const cargarFurgones = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('furgon')
        .select('*, perfil!furgon_id_conductor_fkey(id, nombre, tipo_usuario)')
        .order('marca', { ascending: true })

      if (err) throw err
      setFurgones(data ?? [])
    } catch (err) {
      console.error('Error al cargar furgones:', err)
      setError('No se pudieron cargar los furgones. Intenta recargar la página.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarFurgones()
  }, [cargarFurgones])

  // ── Toast ───────────────────────────────────────────────────

  function mostrarToast(tipo, mensaje) {
    setToast({ tipo, mensaje })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Acciones ────────────────────────────────────────────────

  function handleEditar(furgon) {
    setFurgonEditando(furgon)
    setFormAbierto(true)
  }

  function handleAgregarNuevo() {
    setFurgonEditando(null)
    setFormAbierto(true)
  }

  async function handleGuardado() {
    setFormAbierto(false)
    mostrarToast('success', furgonEditando
      ? 'Furgón actualizado correctamente.'
      : 'Furgón agregado correctamente.')
    setFurgonEditando(null)
    await cargarFurgones()
  }

  async function handleConfirmarEliminar() {
    if (!furgonEliminando) return
    setEliminandoCargando(true)
    try {
      const { error: err } = await supabase
        .from('furgon')
        .delete()
        .eq('id', furgonEliminando.id)

      if (err) throw err

      mostrarToast('success', `Furgón ${furgonEliminando.matricula} eliminado.`)
      setFurgonEliminando(null)
      await cargarFurgones()
    } catch (err) {
      console.error('Error al eliminar furgón:', err)
      mostrarToast('error', 'No se pudo eliminar el furgón. Intenta nuevamente.')
    } finally {
      setEliminandoCargando(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="furgones-page">

      {/* Toast */}
      {toast && (
        <div className={`furgones-toast furgones-toast--${toast.tipo}`}>
          {toast.tipo === 'success' ? '✅' : '⚠️'} {toast.mensaje}
        </div>
      )}

      {/* Header */}
      <div className="furgones-header">
        <div>
          <h1 className="furgones-header__titulo">🚌 Furgones</h1>
          <p className="furgones-header__sub">
            {loading ? 'Cargando...' : `${furgones.length} furgón${furgones.length !== 1 ? 'es' : ''} registrado${furgones.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="furgones-header__acciones">
          <button
            className="sh-btn"
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={handleAgregarNuevo}
          >
            ➕ Agregar furgón
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="sh-alert sh-alert--error" style={{ marginBottom: 'var(--space-4)' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="furgones-loading">
          <div className="sh-spinner sh-spinner--dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p>Cargando furgones...</p>
        </div>
      ) : (
        <TablaFurgones
          furgones={furgones}
          onEditar={handleEditar}
          onEliminar={f => setFurgonEliminando(f)}
        />
      )}

      {/* Modal formulario */}
      {formAbierto && (
        <FormFurgon
          furgon={furgonEditando}
          onGuardado={handleGuardado}
          onCerrar={() => { setFormAbierto(false); setFurgonEditando(null) }}
        />
      )}

      {/* Modal confirmación eliminar */}
      {furgonEliminando && (
        <ModalConfirmar
          titulo="Eliminar furgón"
          mensaje={`¿Estás seguro de que deseas eliminar el furgón ${furgonEliminando.matricula}? Esta acción no se puede deshacer.`}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setFurgonEliminando(null)}
          cargando={eliminandoCargando}
        />
      )}

    </div>
  )
}
