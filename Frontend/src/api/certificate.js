import { API_BASE_URL, apiJson } from './client'

export function getCertificate(certificateId) {
  return apiJson(`/api/certificate/${encodeURIComponent(certificateId)}`)
}

export function previewCertificate(certificateId) {
  return apiJson(`/api/certificate/${encodeURIComponent(certificateId)}/preview`)
}

export function certificateDownloadUrl(certificateId) {
  return `${API_BASE_URL}/api/certificate/${encodeURIComponent(certificateId)}/download`
}
