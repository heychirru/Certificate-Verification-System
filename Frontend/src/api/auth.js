import { apiJson } from './client'

export function login(credentials) {
  return apiJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function register(payload) {
  return apiJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyEmail(token) {
  return apiJson(`/api/auth/verify-email?token=${token}`, {
    method: 'GET',
  })
}

export function clerkTokenExchange(clerkToken) {
  return apiJson('/api/auth/clerk-token', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkToken}`,
    },
  })
}

export function refresh() {
  return apiJson('/api/auth/refresh', {
    method: 'POST',
  })
}

export function me() {
  return apiJson('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('cvs_access_token') || ''}`,
    },
  })
}

export function logout() {
  return apiJson('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('cvs_access_token') || ''}`,
    },
  })
}

export function resendVerification(email) {
  return apiJson('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}
