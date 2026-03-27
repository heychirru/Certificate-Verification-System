import { apiJson } from './client'
import { getAccessToken, setAccessToken, clearAccessToken } from '../auth/token'
import { refresh, me } from './auth'

export async function apiJsonAuth(path, options = {}) {
  const token = getAccessToken()
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  try {
    return await apiJson(path, { ...options, headers })
  } catch (error) {
    const isUnauthorized = error?.status === 401
    if (!isUnauthorized) throw error

    try {
      const refreshed = await refresh()
      if (!refreshed?.accessToken) throw error
      setAccessToken(refreshed.accessToken)
      return await apiJson(path, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${refreshed.accessToken}`,
        },
      })
    } catch (refreshError) {
      clearAccessToken()
      throw refreshError
    }
  }
}

export async function getCurrentUser() {
  if (!getAccessToken()) return null
  try {
    const response = await me()
    return response?.user ?? null
  } catch {
    return null
  }
}
