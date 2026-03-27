const API_BASE_URL_ENV = (import.meta.env.VITE_API_BASE_URL || '').trim()
const API_FALLBACK_URL_ENV = (import.meta.env.VITE_API_FALLBACK_URL || '').trim()
const DEV_URL = 'http://localhost:5000'
const DEFAULT_PROD_URL = 'https://cvs-backend.onrender.com'

export const API_BASE_URL =
  API_BASE_URL_ENV || (import.meta.env.DEV ? DEV_URL : DEFAULT_PROD_URL)
const API_FALLBACK_URL = API_FALLBACK_URL_ENV || DEV_URL

export function formatApiError(err) {
  if (err?.details && Array.isArray(err.details)) {
    return err.details.map((d) => d.message || `${d.field}: ${d.msg || ''}`).join(' ')
  }
  return err?.message || 'Something went wrong'
}

/**
 * @param {string} path - e.g. /api/auth/login
 * @param {RequestInit} [options]
 */
export async function apiJson(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  const tryUrl = async (baseUrl) => {
    const url = `${baseUrl}${normalizedPath}`
    const { headers: extraHeaders, body, ...rest } = options
    return fetch(url, {
      ...rest,
      credentials: 'include',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...extraHeaders,
      },
      body,
    })
  }

  let res
  try {
    res = await tryUrl(API_BASE_URL)
  } catch (err) {
    if (!API_FALLBACK_URL || API_FALLBACK_URL === API_BASE_URL) throw err
    console.warn('Primary URL failed, trying fallback:', API_BASE_URL, err.message)
    res = await tryUrl(API_FALLBACK_URL)
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text || 'Invalid response' }
    }
  }

  if (!res.ok) {
    const message =
      typeof data?.error === 'string'
        ? data.error
        : data?.error?.message || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.details = data?.details
    error.payload = data
    throw error
  }

  return data
}
