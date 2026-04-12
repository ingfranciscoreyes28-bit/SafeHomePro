import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import '../styles/global.css'
import '../styles/Login.css'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  function validar() {
    const nuevosErrores = {}

    if (!correo.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido'
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria'
    } else if (password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    return nuevosErrores
  }

  async function handleLogin(e) {
    e.preventDefault()
    setErrorGeneral('')

    const erroresValidacion = validar()
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setCargando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: correo.trim().toLowerCase(),
      password,
    })

    setCargando(false)

    if (error) {
      if (error.message.toLowerCase().includes('invalid')) {
        setErrorGeneral('Correo o contraseña incorrectos. Verifica tus datos.')
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        setErrorGeneral('Debes confirmar tu correo electrónico antes de ingresar.')
      } else {
        setErrorGeneral('Ocurrió un error al iniciar sesión. Intenta nuevamente.')
      }
      return
    }

    navigate('/dashboard')
  }

  function handleCampoChange(campo, valor) {
    if (errores[campo]) {
      setErrores(prev => {
        const copia = { ...prev }
        delete copia[campo]
        return copia
      })
    }
    if (errorGeneral) setErrorGeneral('')
    if (campo === 'correo') setCorreo(valor)
    if (campo === 'password') setPassword(valor)
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Marca */}
        <div className="login-brand">
          <div className="login-brand__icon">🚌</div>
          <h1 className="login-brand__title">
            Safe<span>Home</span>
          </h1>
          <p className="login-brand__subtitle">Gestión de transporte escolar</p>
          <div className="login-brand__badge">
            🔒 Plataforma segura para apoderados y conductores
          </div>
        </div>

        {/* Encabezado del form */}
        <div className="login-form-header">
          <h2 className="login-form-header__title">Iniciar sesión</h2>
          <p className="login-form-header__text">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Error general */}
        {errorGeneral && (
          <div className="sh-alert sh-alert--error login-alert" role="alert">
            <span>⚠️</span>
            <span>{errorGeneral}</span>
          </div>
        )}

        {/* Formulario */}
        <form className="login-form" onSubmit={handleLogin} noValidate>

          {/* Campo correo */}
          <div className="login-field">
            <label className="sh-label" htmlFor="login-correo">
              Correo electrónico
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon" aria-hidden="true">📧</span>
              <input
                id="login-correo"
                type="email"
                className={`sh-input${errores.correo ? ' sh-input--error' : ''}`}
                placeholder="tu@correo.com"
                value={correo}
                onChange={e => handleCampoChange('correo', e.target.value)}
                autoComplete="email"
                autoFocus
                aria-describedby={errores.correo ? 'login-correo-error' : undefined}
                aria-invalid={!!errores.correo}
              />
            </div>
            {errores.correo && (
              <span id="login-correo-error" className="sh-field-error" role="alert">
                ⚠ {errores.correo}
              </span>
            )}
          </div>

          {/* Campo contraseña */}
          <div className="login-field">
            <label className="sh-label" htmlFor="login-password">
              Contraseña
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon" aria-hidden="true">🔑</span>
              <input
                id="login-password"
                type={mostrarPassword ? 'text' : 'password'}
                className={`sh-input${errores.password ? ' sh-input--error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={e => handleCampoChange('password', e.target.value)}
                autoComplete="current-password"
                aria-describedby={errores.password ? 'login-password-error' : undefined}
                aria-invalid={!!errores.password}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setMostrarPassword(v => !v)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errores.password && (
              <span id="login-password-error" className="sh-field-error" role="alert">
                ⚠ {errores.password}
              </span>
            )}
          </div>

          {/* Botón de envío */}
          <div className="login-submit">
            <button
              type="submit"
              className="sh-btn"
              disabled={cargando}
              aria-busy={cargando}
            >
              {cargando ? (
                <>
                  <span className="sh-spinner" aria-hidden="true" />
                  Ingresando...
                </>
              ) : (
                <>
                  🚀 Ingresar
                </>
              )}
            </button>
          </div>

        </form>

        {/* Pie — link a registro */}
        <div className="login-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/registro">Regístrate aquí</Link>
        </div>

      </div>
    </div>
  )
}
