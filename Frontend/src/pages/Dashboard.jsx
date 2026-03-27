import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'
import { previewCertificate, certificateDownloadUrl } from '../api/certificate'
import { getSearchLogs } from '../api/search'
import {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent,
  uploadStudentsExcel,
} from '../api/students'
import { formatApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const initialStudent = {
  certificateId: '',
  studentName: '',
  email: '',
  internshipDomain: '',
  startDate: '',
  endDate: '',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, signOutLocal } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [certId, setCertId] = useState('')
  const [certResult, setCertResult] = useState(null)
  const [certError, setCertError] = useState('')
  const [students, setStudents] = useState([])
  const [studentForm, setStudentForm] = useState(initialStudent)
  const [logs, setLogs] = useState([])
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const loadStudents = useCallback(async () => {
    if (!isAdmin) return
    const res = await listStudents({ page: 1, limit: 25, search: query })
    setStudents(res?.data || [])
  }, [isAdmin, query])

  const loadLogs = useCallback(async () => {
    if (!isAdmin) return
    const res = await getSearchLogs(1, 20)
    setLogs(res?.logs || [])
  }, [isAdmin])

  useEffect(() => {
    loadStudents().catch(() => {})
    loadLogs().catch(() => {})
  }, [loadStudents, loadLogs])

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // No-op, local sign out is enough for UI.
    }
    signOutLocal()
    navigate('/sign-in', { replace: true })
  }

  async function handlePreview(e) {
    e.preventDefault()
    setBusy(true)
    setCertError('')
    setCertResult(null)
    try {
      const res = await previewCertificate(certId.trim())
      setCertResult(res)
    } catch (error) {
      setCertError(formatApiError(error))
    } finally {
      setBusy(false)
    }
  }

  async function handleCreateStudent(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await createStudent(studentForm)
      setMessage('Student created successfully.')
      setStudentForm(initialStudent)
      await loadStudents()
    } catch (error) {
      setMessage(formatApiError(error))
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdateStudent(id) {
    setBusy(true)
    setMessage('')
    try {
      await updateStudent(id, {
        studentName: prompt('New student name') || undefined,
      })
      setMessage('Student updated successfully.')
      await loadStudents()
    } catch (error) {
      setMessage(formatApiError(error))
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteStudent(id) {
    if (!confirm(`Delete student with certificate ID ${id}?`)) return
    setBusy(true)
    setMessage('')
    try {
      await deleteStudent(id)
      setMessage('Student deleted successfully.')
      await loadStudents()
    } catch (error) {
      setMessage(formatApiError(error))
    } finally {
      setBusy(false)
    }
  }

  async function handleUploadFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setMessage('')
    try {
      const res = await uploadStudentsExcel(file)
      setMessage(res?.message || 'Upload complete.')
      await loadStudents()
    } catch (error) {
      setMessage(formatApiError(error))
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Signed in as {user?.name || user?.email} ({user?.role})
          </p>
        </div>
        <button onClick={handleLogout} className="dash-btn">
          Logout
        </button>
      </header>

      <section className="dash-card">
        <h2>Certificate Preview + Download</h2>
        <form onSubmit={handlePreview} className="dash-row">
          <input
            placeholder="CERT-001"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            required
          />
          <button className="dash-btn" disabled={busy}>
            Preview
          </button>
        </form>
        {certError ? <p className="dash-error">{certError}</p> : null}
        {certResult ? (
          <div className="dash-result">
            <p>{certResult.studentName}</p>
            <p>{certResult.internshipDomain}</p>
            <a href={certificateDownloadUrl(certResult.certificateId)} target="_blank" rel="noreferrer">
              Download PDF
            </a>
          </div>
        ) : null}
      </section>

      {isAdmin ? (
        <>
          <section className="dash-card">
            <h2>Students</h2>
            <form onSubmit={handleCreateStudent} className="dash-grid">
              {Object.keys(initialStudent).map((key) => (
                <input
                  key={key}
                  type={key.includes('Date') ? 'date' : 'text'}
                  placeholder={key}
                  value={studentForm[key]}
                  onChange={(e) => setStudentForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  required
                />
              ))}
              <button className="dash-btn" disabled={busy}>
                Add Student
              </button>
            </form>
            <div className="dash-row">
              <input
                placeholder="Search by name or cert ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="dash-btn" onClick={() => loadStudents()}>
                Search
              </button>
              <label className="dash-upload">
                Upload Excel
                <input type="file" accept=".xlsx,.xls" onChange={handleUploadFile} />
              </label>
            </div>
            {message ? <p>{message}</p> : null}
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Certificate ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Domain</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.certificateId}>
                      <td>{s.certificateId}</td>
                      <td>{s.studentName}</td>
                      <td>{s.email}</td>
                      <td>{s.internshipDomain}</td>
                      <td>
                        <button onClick={() => handleUpdateStudent(s.certificateId)}>Edit</button>
                        <button onClick={() => handleDeleteStudent(s.certificateId)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dash-card">
            <h2>Recent Search Logs</h2>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Certificate ID</th>
                    <th>Found</th>
                    <th>IP</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l._id}>
                      <td>{l.certificateId}</td>
                      <td>{l.found ? 'Yes' : 'No'}</td>
                      <td>{l.ip}</td>
                      <td>{new Date(l.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
