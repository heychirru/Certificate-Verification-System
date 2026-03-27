const PRIMARY_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const FALLBACK_URL = import.meta.env.VITE_API_FALLBACK_URL ?? 'http://localhost:5000'
export const API_BASE_URL = PRIMARY_URL || FALLBACK_URL

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
  const tryUrl = async (baseUrl) => {
    const url = `${baseUrl}${path}`
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
    // Try primary URL first
    res = await tryUrl(PRIMARY_URL)
  } catch (err) {
    console.warn('⚠️ Primary URL failed, trying fallback:', PRIMARY_URL, err.message)
    // Fallback to local development server
    res = await tryUrl(FALLBACK_URL)
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
