import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)   // true while checking stored token

  // ── Restore session from localStorage on mount ──────────────────────── #
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authService.getProfile()
        .then((data) => setUser(data.data.user))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    const { user, tokens } = data.data
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (formData) => {
    const data = await authService.register(formData)
    const { user, tokens } = data.data
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch {}
    localStorage.clear()
    setUser(null)
  }, [])

  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
