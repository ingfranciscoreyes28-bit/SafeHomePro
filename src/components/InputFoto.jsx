import { useState, useEffect, useRef } from 'react'
import '../styles/InputFoto.css'

/**
 * Componente de seleccion y preview de foto.
 * NO sube nada: solo notifica al padre via callbacks.
 *
 * Props:
 *   valorActual          {string|null}  URL de la foto ya guardada en BD
 *   onArchivoSeleccionado {Function}   Recibe el File cuando el usuario elige uno
 *   onLimpiar            {Function}    Llamado cuando el usuario elimina la foto
 *   label                {string}      Etiqueta del campo (default "Foto")
 *   disabled             {boolean}     Deshabilita la interaccion
 */
export default function InputFoto({
  valorActual = null,
  onArchivoSeleccionado,
  onLimpiar,
  label = 'Foto',
  disabled = false,
}) {
  const [previewLocal, setPreviewLocal] = useState(null)
  const inputRef = useRef(null)

  // Limpia el object URL al desmontar o cuando cambie previewLocal
  useEffect(() => {
    return () => {
      if (previewLocal) {
        URL.revokeObjectURL(previewLocal)
      }
    }
  }, [previewLocal])

  function handleSeleccion(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Limpiar preview anterior si existia
    if (previewLocal) {
      URL.revokeObjectURL(previewLocal)
    }

    const nuevaPreview = URL.createObjectURL(file)
    setPreviewLocal(nuevaPreview)
    onArchivoSeleccionado?.(file)

    // Resetear el input para permitir reseleccionar el mismo archivo
    e.target.value = ''
  }

  function handleEliminar() {
    if (previewLocal) {
      URL.revokeObjectURL(previewLocal)
      setPreviewLocal(null)
    }
    onLimpiar?.()
  }

  // Prioridad de la imagen a mostrar: previewLocal > valorActual > placeholder
  const imagenAMostrar = previewLocal ?? valorActual ?? null
  const hayImagen = !!imagenAMostrar

  return (
    <div className="input-foto-wrapper">
      <span className="sh-label" style={{ marginBottom: 0 }}>{label}</span>

      {hayImagen ? (
        <img
          src={imagenAMostrar}
          alt="Preview"
          className="input-foto-preview"
        />
      ) : (
        <div className="input-foto-placeholder" aria-label="Sin foto">
          📷
        </div>
      )}

      <div className="input-foto-acciones">
        <button
          type="button"
          className="input-foto-btn"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {hayImagen ? 'Cambiar foto' : 'Seleccionar foto'}
        </button>

        {hayImagen && (
          <button
            type="button"
            className="input-foto-btn input-foto-eliminar"
            disabled={disabled}
            onClick={handleEliminar}
          >
            ✕ Eliminar foto
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="input-foto-input-oculto"
        onChange={handleSeleccion}
        disabled={disabled}
      />
    </div>
  )
}
