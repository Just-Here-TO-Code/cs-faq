import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, fetchMe, setAuthToken } from '../services/api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'crowdfaq-token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setUser(null)
  }, [])

  const applySession = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token)
    setAuthToken(token)
    setUser(userData)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    setAuthToken(token)
    fetchMe()
      .then(data => setUser(data.user))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [logout])

  async function login(email, password) {
    const data = await apiLogin({ email, password })
    applySession(data.token, data.user)
    return data.user
  }

  async function register(name, email, password) {
    const data = await apiRegister({ name, email, password })
    applySession(data.token, data.user)
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
