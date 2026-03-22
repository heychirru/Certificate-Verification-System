/**
 * API base URL. Empty string uses same origin (Vite dev proxy → backend).
 * For production builds, set VITE_API_BASE_URL to your API origin.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

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
  const url = `${API_BASE_URL}${path}`
  const { headers: extraHeaders, body, ...rest } = options
  const res = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body,
  })

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
