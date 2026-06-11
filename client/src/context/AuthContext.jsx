import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, fetchMe, setAuthToken, toggleSaveFAQ } from '../services/api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'crowdfaq-token'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
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
    if (!token) { setLoading(false); return }
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

  /** Toggle save/unsave FAQ. Updates local user state. Returns { saved: bool } */
  async function saveFAQ(faqId) {
    if (!user) return { saved: false }
    const result = await toggleSaveFAQ(faqId)
    // Update the savedFAQs list in local state
    setUser(u => ({
      ...u,
      savedFAQs: result.savedFAQs,
    }))
    return result
  }

  /** Check if a FAQ is saved by current user */
  function isFAQSaved(faqId) {
    if (!user?.savedFAQs) return false
    return user.savedFAQs.some(id =>
      (typeof id === 'object' ? id._id || id : id).toString() === faqId.toString()
    )
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, saveFAQ, isFAQSaved, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
