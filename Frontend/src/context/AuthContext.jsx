/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../api/session'
import { clearAccessToken, getAccessToken } from '../auth/token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (!getAccessToken()) {
        if (mounted) setLoading(false)
        return
      }
      const currentUser = await getCurrentUser()
      if (!mounted) return
      if (!currentUser) clearAccessToken()
      setUser(currentUser)
      setLoading(false)
    }
    init()
    return () => {
      mounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      signOutLocal: () => {
        clearAccessToken()
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
