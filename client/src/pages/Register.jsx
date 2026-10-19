import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'
import { Notice } from '../components/Notice'
import { usePageTitle } from '../utils/format'

export default function Register() {
  usePageTitle('Create account')
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await register(form.name, form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <main className="container auth-page">
      <h1 className="h2 mb-4">Create your account</h1>
      <form onSubmit={handleSubmit} noValidate>
        <Notice>{error}</Notice>
        <div className="mb-3">
          <label className="form-label" htmlFor="name">Name</label>
          <input id="name" className="form-control" autoComplete="name" required value={form.name} onChange={set('name')} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="form-control" autoComplete="email" required value={form.email} onChange={set('email')} />
        </div>
        <div className="mb-4">
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" type="password" className="form-control" autoComplete="new-password" required minLength={6} value={form.password} onChange={set('password')} />
          <div className="form-text">At least 6 characters.</div>
        </div>
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
      </form>
      <p className="mt-4 mb-0">
        Already have an account? <Link to="/login" state={{ from }}>Log in</Link>
      </p>
    </main>
  )
}
