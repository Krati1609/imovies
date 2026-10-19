import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { tokenStore } from '../services/api'

const AuthContext = createContext(null)

// Holds the logged-in user for the whole app.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(tokenStore.get()))

  // On first load, if a token is saved, ask the server who it belongs to.
  useEffect(() => {
    if (!tokenStore.get()) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const authenticate = useCallback(async (path, body) => {
    const { data } = await api.post(path, body)
    tokenStore.set(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback((email, password) => authenticate('/auth/login', { email, password }), [authenticate])
  const register = useCallback(
    (name, email, password) => authenticate('/auth/register', { name, email, password }),
    [authenticate],
  )
  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
