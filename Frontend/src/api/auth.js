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
