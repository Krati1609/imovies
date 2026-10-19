import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'
import { Notice } from '../components/Notice'
import { usePageTitle } from '../utils/format'

export default function Login() {
  usePageTitle('Log in')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <main className="container auth-page">
      <h1 className="h2 mb-4">Log in</h1>
      <form onSubmit={handleSubmit} noValidate>
        <Notice>{error}</Notice>
        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="form-control" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" type="password" className="form-control" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
      </form>
      <p className="mt-4 mb-0">
        New here? <Link to="/register" state={{ from }}>Create an account</Link>
      </p>
    </main>
  )
}
