import { API_BASE_URL } from './client'
import { apiJsonAuth } from './session'
import { getAccessToken } from '../auth/token'

export function listStudents(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })
  return apiJsonAuth(`/api/data/students?${query.toString()}`)
}

export function createStudent(payload) {
  return apiJsonAuth('/api/data/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateStudent(certificateId, payload) {
  return apiJsonAuth(`/api/data/students/${encodeURIComponent(certificateId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteStudent(certificateId) {
  return apiJsonAuth(`/api/data/students/${encodeURIComponent(certificateId)}`, {
    method: 'DELETE',
  })
}

export async function uploadStudentsExcel(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/data/upload`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${getAccessToken() || ''}`,
    },
    body: formData,
  })

  const text = await response.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { error: text || 'Upload failed' }
  }
  if (!response.ok && response.status !== 207) {
    const err = new Error(data.error || 'Upload failed')
    err.status = response.status
    err.payload = data
    throw err
  }
  return data
}
