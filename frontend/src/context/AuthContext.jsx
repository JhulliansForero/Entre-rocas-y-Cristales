import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import * as authService from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      authService.getProfile()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          delete api.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials)
    const { access, refresh, user: userData } = res.data
    localStorage.setItem('access',  access)
    localStorage.setItem('refresh', refresh)
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const res = await authService.register(data)
    const { access, refresh, user: userData } = res.data
    localStorage.setItem('access',  access)
    localStorage.setItem('refresh', refresh)
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout(localStorage.getItem('refresh')) } catch {}
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
