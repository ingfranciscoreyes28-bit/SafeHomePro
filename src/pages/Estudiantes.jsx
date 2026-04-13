import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import TablaEstudiantes from '../components/TablaEstudiantes'
import FormEstudiante from '../components/FormEstudiante'
import ModalConfirmar from '../components/ModalConfirmar'
import '../styles/Estudiantes.css'
import '../styles/Conductores.css'
import ChatWidget from "../components/ChatWidget";

function Toast({ mensaje, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`estudiantes-toast estudiantes-toast--${tipo}`}>
      {tipo === 'success' ? '✅' : '❌'} {mensaje}
    </div>
  )
}

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([])
  const [cargando, setCargando]       = useState(true)
  const [busqueda, setBusqueda]       = useState('')

  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando]       = useState(null)

  const [eliminando, setEliminando] = useState(null)
  const [borrando, setBorrando]     = useState(false)

  const [toast, setToast] = useState(null)

  function mostrarToast(mensaje, tipo = 'success') {
    setToast({ mensaje, tipo })
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('estudiante')
      .select('*, perfil!id_apoderado(id, nombre), furgon!id_furgon(id, matricula, marca, modelo)')
      .order('nombre_estudiante')
    if (!error) setEstudiantes(data ?? [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const estudiantesFiltrados = estudiantes.filter(e =>
    !busqueda.trim() ||
    e.nombre_estudiante?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.rut_estudiante?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.colegio?.toLowerCase().includes(busqueda.toLowerCase())
  )

  function abrirAgregar() {
    setEditando(null)
    setFormAbierto(true)
  }

  function abrirEditar(estudiante) {
    setEditando(estudiante)
    setFormAbierto(true)
  }

  function cerrarForm() {
    setFormAbierto(false)
    setEditando(null)
  }

  async function handleGuardado() {
    cerrarForm()
    await cargar()
    mostrarToast(editando ? 'Estudiante actualizado correctamente' : 'Estudiante agregado correctamente')
  }

  function abrirEliminar(estudiante) { setEliminando(estudiante) }
  function cerrarEliminar() { setEliminando(null) }

  async function handleEliminar() {
    setBorrando(true)
    const { error } = await supabase.from('estudiante').delete().eq('id', eliminando.id)
    setBorrando(false)
    if (error) {
      cerrarEliminar()
      mostrarToast('Error al eliminar el estudiante', 'error')
      return
    }
    cerrarEliminar()
    await cargar()
    mostrarToast('Estudiante eliminado')
  }

  return (
    <div className="estudiantes-page">
      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}

      <div className="estudiantes-header">
        <div>
          <h1 className="estudiantes-header__titulo">Estudiantes</h1>
          <p className="estudiantes-header__sub">
            {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''} registrado{estudiantes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="sh-btn" onClick={abrirAgregar}>
          ➕ Agregar estudiante
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <input
          type="text"
          className="sh-input"
          placeholder="Buscar por nombre, RUT o colegio..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      {cargando ? (
        <div className="estudiantes-loading">
          <span className="sh-spinner" />
          <span>Cargando estudiantes...</span>
        </div>
      ) : (
        <TablaEstudiantes
          estudiantes={estudiantesFiltrados}
          onEditar={abrirEditar}
          onEliminar={abrirEliminar}
        />
      )}

      {formAbierto && (
        <FormEstudiante
          estudiante={editando}
          onGuardado={handleGuardado}
          onCerrar={cerrarForm}
        />
      )}

      {eliminando && (
        <ModalConfirmar
          titulo="Eliminar estudiante"
          mensaje={`¿Seguro que deseas eliminar a ${eliminando.nombre_estudiante}? Esta acción no se puede deshacer.`}
          onConfirmar={handleEliminar}
          onCancelar={cerrarEliminar}
          cargando={borrando}
        />
      )}

<ChatWidget />


    </div>
  )
}
