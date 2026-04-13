import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import '../styles/global.css'
import '../styles/Registro.css'

const ROLE_TIPS = {
  apoderado: {
    icon: '👨‍👩‍👧',
    text: 'Como apoderado podrás ver la ubicación del furgón, el estado de tu hijo/a y comunicarte con el conductor.',
  },
  conductor: {
    icon: '🚌',
    text: 'Como conductor gestionarás tus rutas, la lista de estudiantes y podrás marcar asistencia diaria.',
  },
}


function calcularFortaleza(password) {
  if (!password) return 0
  let puntos = 0
  if (password.length >= 6) puntos++
  if (password.length >= 10) puntos++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) puntos++
  return Math.min(puntos, 3)
}

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [registrado, setRegistrado] = useState(false)
  const navigate = useNavigate()

  const fortaleza = calcularFortaleza(password)
  const fortalezaLabels = ['', 'Contraseña débil', 'Contraseña regular', 'Contraseña segura']

  function validar() {
    const e = {}

    if (!nombre.trim()) {
      e.nombre = 'El nombre es obligatorio'
    } else if (nombre.trim().length < 2) {
      e.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!correo.trim()) {
      e.correo = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      e.correo = 'Ingresa un correo electrónico válido'
    }

    if (!password) {
      e.password = 'La contraseña es obligatoria'
    } else if (password.length < 6) {
      e.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!confirmar) {
      e.confirmar = 'Debes confirmar la contraseña'
    } else if (password && confirmar !== password) {
      e.confirmar = 'Las contraseñas no coinciden'
    }

    if (!tipoUsuario) {
      e.tipoUsuario = 'Selecciona tu tipo de usuario'
    }

    return e
  }

  async function handleRegistro(e) {
    e.preventDefault()
    setErrorGeneral('')

    const erroresValidacion = validar()
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setCargando(true)

    const { data, error } = await supabase.auth.signUp({
      email: correo.trim().toLowerCase(),
      password,
      options: {
        data: {
          nombre: nombre.trim(),
          tipo_usuario: tipoUsuario,
        },
      },
    })

    if (error) {
      setCargando(false)
      if (error.message.toLowerCase().includes('already registered')) {
        setErrorGeneral('Este correo ya está registrado. ¿Quieres iniciar sesión?')
      } else if (error.message.toLowerCase().includes('password')) {
        setErrores(prev => ({ ...prev, password: 'La contraseña no cumple los requisitos mínimos' }))
      } else {
        setErrorGeneral('Ocurrió un error al registrarte. Intenta nuevamente.')
      }
      return
    }

    // Insertar en la tabla perfil si el usuario fue creado correctamente
    if (data?.user) {
      const { error: perfilError } = await supabase.from('perfil').upsert(
        {
          id: data.user.id,
          nombre: nombre.trim(),
          tipo_usuario: tipoUsuario,
          rut: '',
          telefono: '',
          estado: tipoUsuario === 'conductor' ? 'pendiente' : 'aprobado',
        },
        { onConflict: 'id' }
      )

      if (perfilError) {
        console.error('Error perfil completo:', JSON.stringify(perfilError))
        setCargando(false)
        setErrorGeneral('Cuenta creada, pero no se pudo guardar tu perfil. Contacta a soporte.')
        return
      }
    }

    setCargando(false)
    setRegistrado(true)

    setTimeout(() => {
      navigate('/login')
    }, 3000)
  }

  function limpiarError(campo) {
    if (errores[campo]) {
      setErrores(prev => {
        const copia = { ...prev }
        delete copia[campo]
        return copia
      })
    }
    if (errorGeneral) setErrorGeneral('')
  }

  if (registrado) {
    return (
      <div className="registro-page">
        <div className="registro-card">
          <div className="registro-success">
            <div className="registro-success__icon">✅</div>
            <h2 className="registro-success__title">¡Registro exitoso!</h2>
            <p className="registro-success__text">
              Tu cuenta ha sido creada correctamente, <strong>{nombre.trim()}</strong>.<br />
              Revisa tu correo para confirmar tu cuenta antes de ingresar.
            </p>
            <p className="registro-success__redirect">
              Redirigiendo al inicio de sesión...
            </p>
            <Link to="/login" className="sh-btn" style={{ maxWidth: 220, textDecoration: 'none' }}>
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="registro-page">
      <div className="registro-card">

        {/* Marca */}
        <div className="registro-brand">
          <div className="registro-brand__icon">🏫</div>
          <h1 className="registro-brand__title">
            Safe<span>Home</span>
          </h1>
          <p className="registro-brand__subtitle">Crea tu cuenta gratuita</p>
        </div>

        {/* Encabezado */}
        <div className="registro-form-header">
          <h2 className="registro-form-header__title">Crear cuenta</h2>
          <p className="registro-form-header__text">Completa el formulario para registrarte en la plataforma</p>
        </div>

        {/* Error general */}
        {errorGeneral && (
          <div className="sh-alert sh-alert--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
            <span>⚠️</span>
            <span>{errorGeneral}</span>
          </div>
        )}

        {/* Formulario */}
        <form className="registro-form" onSubmit={handleRegistro} noValidate>

          {/* Nombre */}
          <div className="registro-field">
            <label className="sh-label" htmlFor="reg-nombre">
              Nombre completo
            </label>
            <div className="registro-input-wrapper">
              <span className="registro-input-icon" aria-hidden="true">👤</span>
              <input
                id="reg-nombre"
                type="text"
                className={`sh-input${errores.nombre ? ' sh-input--error' : ''}`}
                placeholder="Ej: María González"
                value={nombre}
                onChange={e => { setNombre(e.target.value); limpiarError('nombre') }}
                autoComplete="name"
                autoFocus
                aria-describedby={errores.nombre ? 'reg-nombre-error' : undefined}
                aria-invalid={!!errores.nombre}
              />
            </div>
            {errores.nombre && (
              <span id="reg-nombre-error" className="sh-field-error" role="alert">
                ⚠ {errores.nombre}
              </span>
            )}
          </div>

          {/* Correo */}
          <div className="registro-field">
            <label className="sh-label" htmlFor="reg-correo">
              Correo electrónico
            </label>
            <div className="registro-input-wrapper">
              <span className="registro-input-icon" aria-hidden="true">📧</span>
              <input
                id="reg-correo"
                type="email"
                className={`sh-input${errores.correo ? ' sh-input--error' : ''}`}
                placeholder="tu@correo.com"
                value={correo}
                onChange={e => { setCorreo(e.target.value); limpiarError('correo') }}
                autoComplete="email"
                aria-describedby={errores.correo ? 'reg-correo-error' : undefined}
                aria-invalid={!!errores.correo}
              />
            </div>
            {errores.correo && (
              <span id="reg-correo-error" className="sh-field-error" role="alert">
                ⚠ {errores.correo}
              </span>
            )}
          </div>

          {/* Contraseña */}
          <div className="registro-field">
            <label className="sh-label" htmlFor="reg-password">
              Contraseña
            </label>
            <div className="registro-input-wrapper">
              <span className="registro-input-icon" aria-hidden="true">🔑</span>
              <input
                id="reg-password"
                type={mostrarPassword ? 'text' : 'password'}
                className={`sh-input${errores.password ? ' sh-input--error' : ''}`}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => { setPassword(e.target.value); limpiarError('password') }}
                autoComplete="new-password"
                aria-describedby={errores.password ? 'reg-password-error' : undefined}
                aria-invalid={!!errores.password}
              />
              <button
                type="button"
                className="registro-password-toggle"
                onClick={() => setMostrarPassword(v => !v)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {password.length > 0 && (
              <div className="registro-strength" aria-live="polite">
                <div className="registro-strength__bar" aria-hidden="true">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`registro-strength__segment${
                        fortaleza >= i ? ` registro-strength__segment--active-${fortaleza}` : ''
                      }`}
                    />
                  ))}
                </div>
                <span className="registro-strength__label">{fortalezaLabels[fortaleza]}</span>
              </div>
            )}
            {errores.password && (
              <span id="reg-password-error" className="sh-field-error" role="alert">
                ⚠ {errores.password}
              </span>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="registro-field">
            <label className="sh-label" htmlFor="reg-confirmar">
              Confirmar contraseña
            </label>
            <div className="registro-input-wrapper">
              <span className="registro-input-icon" aria-hidden="true">🔒</span>
              <input
                id="reg-confirmar"
                type={mostrarConfirmar ? 'text' : 'password'}
                className={`sh-input${errores.confirmar ? ' sh-input--error' : ''}`}
                placeholder="Repite tu contraseña"
                value={confirmar}
                onChange={e => { setConfirmar(e.target.value); limpiarError('confirmar') }}
                autoComplete="new-password"
                aria-describedby={errores.confirmar ? 'reg-confirmar-error' : undefined}
                aria-invalid={!!errores.confirmar}
              />
              <button
                type="button"
                className="registro-password-toggle"
                onClick={() => setMostrarConfirmar(v => !v)}
                aria-label={mostrarConfirmar ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              >
                {mostrarConfirmar ? '🙈' : '👁️'}
              </button>
            </div>
            {errores.confirmar && (
              <span id="reg-confirmar-error" className="sh-field-error" role="alert">
                ⚠ {errores.confirmar}
              </span>
            )}
          </div>

          {/* Tipo de usuario */}
          <div className="registro-field">
            <label className="sh-label" htmlFor="reg-tipo">
              Soy un/a...
            </label>
            <div className="registro-input-wrapper">
              <span className="registro-input-icon" aria-hidden="true">🪪</span>
              <select
                id="reg-tipo"
                className={`sh-select${errores.tipoUsuario ? ' sh-input--error' : ''}`}
                value={tipoUsuario}
                onChange={e => { setTipoUsuario(e.target.value); limpiarError('tipoUsuario') }}
                aria-describedby={errores.tipoUsuario ? 'reg-tipo-error' : undefined}
                aria-invalid={!!errores.tipoUsuario}
              >
                <option value="">Selecciona tu rol</option>
                <option value="apoderado">👨‍👩‍👧 Apoderado / Apoderada</option>
                <option value="conductor">🚌 Conductor / Conductora</option>
              </select>
            </div>
            {errores.tipoUsuario && (
              <span id="reg-tipo-error" className="sh-field-error" role="alert">
                ⚠ {errores.tipoUsuario}
              </span>
            )}
            {tipoUsuario && ROLE_TIPS[tipoUsuario] && (
              <div className="registro-role-tip" aria-live="polite">
                <span className="registro-role-tip__icon">{ROLE_TIPS[tipoUsuario].icon}</span>
                <span>{ROLE_TIPS[tipoUsuario].text}</span>
              </div>
            )}
          </div>

          {/* Botón */}
          <div className="registro-submit">
            <button
              type="submit"
              className="sh-btn"
              disabled={cargando}
              aria-busy={cargando}
            >
              {cargando ? (
                <>
                  <span className="sh-spinner" aria-hidden="true" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  ✅ Crear cuenta
                </>
              )}
            </button>
          </div>

        </form>

        {/* Pie */}
        <div className="registro-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </div>

      </div>
    </div>
  )
}
