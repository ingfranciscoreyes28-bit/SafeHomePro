import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import TablaConductores from '../components/TablaConductores'
import FormConductor from '../components/FormConductor'
import ModalConfirmar from '../components/ModalConfirmar'
import '../styles/global.css'
import '../styles/Conductores.css'
import ChatWidget from "../components/ChatWidget";

export default function Conductores() {
  const [conductores, setConductores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroPendientes, setFiltroPendientes] = useState(false)

  // Modales
  const [formAbierto, setFormAbierto] = useState(false)
  const [conductorEditando, setConductorEditando] = useState(null)
  const [conductorEliminando, setConductorEliminando] = useState(null)
  const [eliminandoCargando, setEliminandoCargando] = useState(false)

  // Feedback
  const [toast, setToast] = useState(null) // { tipo: 'success'|'error', mensaje: string }

  // ── Carga de datos ──────────────────────────────────────────

  const cargarConductores = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('perfil')
        .select('*, conductor_detalle(*)')
        .eq('tipo_usuario', 'conductor')
        .order('nombre', { ascending: true })

      if (err) throw err
      setConductores(data ?? [])
    } catch (err) {
      console.error('Error al cargar conductores:', err)
      setError('No se pudieron cargar los conductores. Intenta recargar la página.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarConductores()
  }, [cargarConductores])

  // ── Toast ───────────────────────────────────────────────────

  function mostrarToast(tipo, mensaje) {
    setToast({ tipo, mensaje })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Acciones ────────────────────────────────────────────────

  async function handleAprobar(conductor) {
    try {
      const { error: err } = await supabase
        .from('perfil')
        .update({ estado: 'aprobado' })
        .eq('id', conductor.id)

      if (err) throw err
      mostrarToast('success', `${conductor.nombre} fue aprobado correctamente.`)
      await cargarConductores()
    } catch (err) {
      console.error('Error al aprobar:', err)
      mostrarToast('error', 'No se pudo aprobar al conductor. Intenta nuevamente.')
    }
  }

  async function handleRechazar(conductor) {
    try {
      const { error: err } = await supabase
        .from('perfil')
        .update({ estado: 'rechazado' })
        .eq('id', conductor.id)

      if (err) throw err
      mostrarToast('success', `${conductor.nombre} fue rechazado.`)
      await cargarConductores()
    } catch (err) {
      console.error('Error al rechazar:', err)
      mostrarToast('error', 'No se pudo rechazar al conductor. Intenta nuevamente.')
    }
  }

  async function handleConfirmarEliminar() {
    if (!conductorEliminando) return
    setEliminandoCargando(true)
    try {
      // Eliminar conductor_detalle primero (FK constraint)
      const { error: errorDetalle } = await supabase
        .from('conductor_detalle')
        .delete()
        .eq('id_perfil', conductorEliminando.id)

      if (errorDetalle) throw errorDetalle

      // Luego eliminar perfil
      const { error: errorPerfil } = await supabase
        .from('perfil')
        .delete()
        .eq('id', conductorEliminando.id)

      if (errorPerfil) throw errorPerfil

      mostrarToast('success', `${conductorEliminando.nombre} fue eliminado.`)
      setConductorEliminando(null)
      await cargarConductores()
    } catch (err) {
      console.error('Error al eliminar:', err)
      mostrarToast('error', 'No se pudo eliminar al conductor. Intenta nuevamente.')
    } finally {
      setEliminandoCargando(false)
    }
  }

  function handleEditar(conductor) {
    setConductorEditando(conductor)
    setFormAbierto(true)
  }

  function handleAgregarNuevo() {
    setConductorEditando(null)
    setFormAbierto(true)
  }

  async function handleGuardado() {
    setFormAbierto(false)
    setConductorEditando(null)
    mostrarToast('success', conductorEditando ? 'Conductor actualizado correctamente.' : 'Conductor agregado correctamente.')
    await cargarConductores()
  }

  // ── Lista filtrada ──────────────────────────────────────────

  const listaVisible = filtroPendientes
    ? conductores.filter(c => c.estado === 'pendiente')
    : conductores

  const totalPendientes = conductores.filter(c => c.estado === 'pendiente').length

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="conductores-page">

      {/* Toast */}
      {toast && (
        <div className={`conductores-toast conductores-toast--${toast.tipo}`}>
          {toast.tipo === 'success' ? '✅' : '⚠️'} {toast.mensaje}
        </div>
      )}

      {/* Header de sección */}
      <div className="conductores-header">
        <div>
          <h1 className="conductores-header__titulo">👨‍✈️ Conductores</h1>
          <p className="conductores-header__sub">
            {loading ? 'Cargando...' : `${conductores.length} conductor${conductores.length !== 1 ? 'es' : ''} registrado${conductores.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="conductores-header__acciones">
          <button
            className={`sh-btn-ghost${filtroPendientes ? ' sh-btn-ghost--activo' : ''}`}
            onClick={() => setFiltroPendientes(v => !v)}
          >
            ⏳ Pendientes
            {totalPendientes > 0 && (
              <span className="badge-contador">{totalPendientes}</span>
            )}
          </button>
          <button className="sh-btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={handleAgregarNuevo}>
            ➕ Agregar conductor
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
        <div className="conductores-loading">
          <div className="sh-spinner sh-spinner--dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p>Cargando conductores...</p>
        </div>
      ) : (
        <>
          {filtroPendientes && (
            <div className="conductores-filtro-aviso">
              Mostrando solo conductores pendientes de aprobación
              <button className="conductores-filtro-aviso__limpiar" onClick={() => setFiltroPendientes(false)}>
                Ver todos
              </button>
            </div>
          )}

          <TablaConductores
            conductores={listaVisible}
            onEditar={handleEditar}
            onEliminar={c => setConductorEliminando(c)}
            onAprobar={handleAprobar}
            onRechazar={handleRechazar}
          />
        </>
      )}

      {/* Modal formulario */}
      {formAbierto && (
        <FormConductor
          conductor={conductorEditando}
          onGuardado={handleGuardado}
          onCerrar={() => { setFormAbierto(false); setConductorEditando(null) }}
        />
      )}

      {/* Modal confirmación eliminar */}
      {conductorEliminando && (
        <ModalConfirmar
          titulo="Eliminar conductor"
          mensaje={`¿Estás seguro de que deseas eliminar a ${conductorEliminando.nombre}? Esta acción no se puede deshacer.`}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setConductorEliminando(null)}
          cargando={eliminandoCargando}
        />
      )}

      
    <ChatWidget />

    </div>
    
  )
}
