import { apiJson } from './client'
import { apiJsonAuth } from './session'

export function searchCertificate(certificateId) {
  return apiJson(`/api/search?certificateId=${encodeURIComponent(certificateId)}`)
}

export function verifyCertificate(certificateId) {
  return apiJson(`/api/search/verify/${encodeURIComponent(certificateId)}`)
}

export function verifyBulkCertificates(certificateIds) {
  return apiJson('/api/search/verify', {
    method: 'POST',
    body: JSON.stringify({ certificateIds }),
  })
}

export function getSearchLogs(page = 1, limit = 20) {
  return apiJsonAuth(`/api/search/admin/search-logs?page=${page}&limit=${limit}`)
}
