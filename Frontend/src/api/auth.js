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
