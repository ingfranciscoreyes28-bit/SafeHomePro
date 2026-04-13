import '../styles/Conductores.css'

export default function ModalConfirmar({ titulo, mensaje, onConfirmar, onCancelar, cargando }) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-box__icon">🗑️</div>

        <h2 className="modal-box__titulo">{titulo}</h2>
        <p className="modal-box__mensaje">{mensaje}</p>

        <div className="modal-box__acciones">
          <button
            className="sh-btn-ghost"
            onClick={onCancelar}
            disabled={cargando}
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
          <button
            className="sh-btn-danger"
            onClick={onConfirmar}
            disabled={cargando}
            style={{ flex: 1 }}
          >
            {cargando
              ? <><span className="sh-spinner sh-spinner--dark" /> Eliminando...</>
              : '🗑️ Eliminar'}
          </button>
        </div>

      </div>
    </div>
  )
}
