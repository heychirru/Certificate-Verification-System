import { useState } from 'react'
import { searchCertificate, verifyBulkCertificates, verifyCertificate } from '../api/search'
import { formatApiError } from '../api/client'
import './PublicVerify.css'

export default function PublicVerify() {
  const [id, setId] = useState('')
  const [singleResult, setSingleResult] = useState(null)
  const [searchResult, setSearchResult] = useState(null)
  const [bulkInput, setBulkInput] = useState('')
  const [bulkResult, setBulkResult] = useState(null)
  const [error, setError] = useState('')

  async function onVerify() {
    setError('')
    setSingleResult(null)
    try {
      const res = await verifyCertificate(id.trim())
      setSingleResult(res)
    } catch (e) {
      setError(formatApiError(e))
    }
  }

  async function onSearch() {
    setError('')
    setSearchResult(null)
    try {
      const res = await searchCertificate(id.trim())
      setSearchResult(res)
    } catch (e) {
      setError(formatApiError(e))
    }
  }

  async function onBulkVerify() {
    setError('')
    const certificateIds = bulkInput
      .split(/[\n,]+/)
      .map((v) => v.trim())
      .filter(Boolean)
    try {
      const res = await verifyBulkCertificates(certificateIds)
      setBulkResult(res)
    } catch (e) {
      setError(formatApiError(e))
    }
  }

  return (
    <div className="verify-page">
      <section className="verify-card">
        <h2>Public Certificate Verification</h2>
        <div className="verify-row">
          <input
            placeholder="Enter certificate ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <button onClick={onVerify}>Verify</button>
          <button onClick={onSearch}>Search Details</button>
        </div>
        {error ? <p className="verify-error">{error}</p> : null}
        {singleResult ? <pre>{JSON.stringify(singleResult, null, 2)}</pre> : null}
        {searchResult ? <pre>{JSON.stringify(searchResult, null, 2)}</pre> : null}
      </section>

      <section className="verify-card">
        <h2>Bulk Verify (up to 100)</h2>
        <textarea
          rows={8}
          placeholder="CERT-1, CERT-2 or one per line"
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
        />
        <button onClick={onBulkVerify}>Verify Bulk</button>
        {bulkResult ? <pre>{JSON.stringify(bulkResult, null, 2)}</pre> : null}
      </section>
    </div>
  )
}
