// Todo lo que necesita saber la app sobre quién está conectado vive aquí.


import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
      if (session?.user) obtenerPerfil(session.user.id)
      else setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null)
      if (session?.user) obtenerPerfil(session.user.id)
      else {
        setPerfil(null)
        setCargando(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function obtenerPerfil(id) {
    const { data } = await supabase
      .from('perfil')
      .select('*')
      .eq('id', id)
      .single()

    setPerfil(data)
    setCargando(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ usuario, perfil, cargando, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}