import { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadMe() {
    try {
      const { data } = await api.get('/auth/me/')
      setUser(data)
      return data
    } catch {
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    if (localStorage.getItem('access')) {
      loadMe().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(username, password) {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access', data.access)
    return loadMe()
  }

  function logout() {
    localStorage.removeItem('access')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, reload: loadMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Where each role lands after login
export function homeFor(user) {
  if (!user) return '/login'
  if (user.role === 'driver') return '/driver'
  if (user.role === 'admin') return '/admin-info'
  return '/map'
}
