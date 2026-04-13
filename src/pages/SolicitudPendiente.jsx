import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/global.css'

export default function SolicitudPendiente() {
  const { cerrarSesion, perfil, esConductorRechazado } = useAuth()
  const navigate = useNavigate()

  async function handleSalir() {
    await cerrarSesion()
    navigate('/login')
  }

  const rechazado = esConductorRechazado

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        border: `1px solid ${rechazado ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '3rem 2.5rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
      }}>

        {/* Ícono */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          animation: rechazado ? 'none' : 'pulse 2s ease-in-out infinite',
        }}>
          {rechazado ? '❌' : '🕐'}
        </div>

        {/* Título */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color: rechazado ? '#f87171' : 'var(--color-primary)',
          marginBottom: '0.75rem',
        }}>
          {rechazado ? 'Solicitud rechazada' : 'Solicitud en revisión'}
        </h1>

        {/* Nombre */}
        <p style={{
          fontSize: '1rem',
          color: 'var(--color-text-muted)',
          marginBottom: '1.5rem',
        }}>
          Hola <strong style={{ color: 'var(--color-text)' }}>{perfil?.nombre}</strong>,{' '}
          {rechazado
            ? 'tu solicitud como conductor no fue aprobada.'
            : 'tu solicitud como conductor ha sido recibida correctamente.'}
        </p>

        {/* Card de estado */}
        <div style={{
          background: rechazado ? 'rgba(239,68,68,0.08)' : 'rgba(255, 193, 7, 0.08)',
          border: `1px solid ${rechazado ? 'rgba(239,68,68,0.3)' : 'rgba(255, 193, 7, 0.3)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'left',
          }}>
            {rechazado ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>📋</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Tu solicitud fue revisada por el administrador
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>📧</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Puedes contactar al administrador para más información
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>🔄</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    También puedes registrarte con otro correo
                  </span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>✅</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Cuenta creada correctamente
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>⏳</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Solicitud enviada al administrador
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>🔔</span>
                  <span style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Te notificaremos cuando seas aprobado
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mensaje inferior */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          marginBottom: '2rem',
          lineHeight: '1.6',
        }}>
          {rechazado
            ? 'Si crees que esto es un error, comunícate con el administrador de la plataforma antes de volver a registrarte.'
            : 'El administrador revisará tu solicitud y te habilitará el acceso a la plataforma. Este proceso puede tomar algunas horas.'}
        </p>

        {/* Botones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rechazado && (
            <button
              onClick={() => navigate('/registro')}
              className="sh-btn sh-btn--outline"
              style={{ width: '100%' }}
            >
              🔄 Registrarse con otro correo
            </button>
          )}
          <button
            onClick={handleSalir}
            className="sh-btn"
            style={{ width: '100%' }}
          >
            🚪 Cerrar sesión
          </button>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>

    </div>
  )
}