import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Dashboard() {
  const { perfil, cargando, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!cargando && !perfil) navigate('/login')
  }, [perfil, cargando])

  if (cargando) return <p>Cargando...</p>

  return (
    <div style={{ padding: 24 }}>
      <h2>Bienvenido, {perfil?.nombre}</h2>
      <p>Rol: {perfil?.tipo_usuario}</p>

      {perfil?.tipo_usuario === 'admin' && (
        <div>
          <h3>Panel Admin</h3>
          <p>Gestión de usuarios, furgones, rutas y pagos</p>
        </div>
      )}

      {perfil?.tipo_usuario === 'conductor' && (
        <div>
          <h3>Panel Conductor</h3>
          <p>Tus estudiantes y rutas asignadas</p>
        </div>
      )}

      {perfil?.tipo_usuario === 'apoderado' && (
        <div>
          <h3>Panel Apoderado</h3>
          <p>Furgón y conductor de tu hijo</p>
        </div>
      )}

      <button onClick={cerrarSesion} style={{ marginTop: 24 }}>
        Cerrar sesión
      </button>
    </div>
  )
}