import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Primero recuperar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
      if (session?.user) {
        obtenerPerfil(session.user.id)
      } else {
        setCargando(false)
      }
    })

    // Luego escuchar cambios
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuario(session?.user ?? null)
        if (session?.user) {
          obtenerPerfil(session.user.id)
        } else {
          setPerfil(null)
          setCargando(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function obtenerPerfil(id) {
    const { data, error } = await supabase
      .from('perfil')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error al cargar perfil:', error)
    }

    setPerfil(data ?? null)
    setCargando(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  // Helper para saber si el conductor está pendiente
  const esConductorPendiente =
    perfil?.tipo_usuario === 'conductor' && perfil?.estado === 'pendiente'

  // Helper para saber si fue rechazado
  const esConductorRechazado =
    perfil?.tipo_usuario === 'conductor' && perfil?.estado === 'rechazado'

  return (
    <AuthContext.Provider value={{
      usuario,
      perfil,
      cargando,
      cerrarSesion,
      esConductorPendiente,
      esConductorRechazado,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}